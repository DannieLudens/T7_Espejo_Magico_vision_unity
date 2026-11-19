using System;                     // Math, ArgumentException
using System.Collections.Generic; // List
using System.Text;                // Encoding
using UnityEngine;                // Texture2D, Color32

// Minimal QR Code Model 2 encoder: byte mode (UTF-8), error correction level M, versions 1-40.
// Same output family as qrcode.js with CorrectLevel.M, so phones read the photo URL the same way.
public static class QrEncoder
{
    // Error correction codewords per block for level M, indexed by version (ISO/IEC 18004 table 9).
    static readonly int[] EccPerBlock = { -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28 };
    // Number of error correction blocks for level M, indexed by version.
    static readonly int[] EccBlocks = { -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49 };
    const int EccFormatBitsM = 0; // level M in the format information field

    // Encodes text and returns the module matrix [row, column], true = dark. mask = -1 picks the best mask.
    public static bool[,] Encode(string text, int mask = -1)
    {
        byte[] data = Encoding.UTF8.GetBytes(text);                       // qrcode.js encodes UTF-8 bytes
        int version = 1;                                                  // smallest version that fits
        for (; version <= 40; version++)
        {
            int countBits = version < 10 ? 8 : 16;                        // byte mode character count length
            if (4 + countBits + data.Length * 8 <= DataCodewords(version) * 8) break; // fits
        }
        if (version > 40) throw new ArgumentException("Text too long for a QR code");

        var bits = new List<bool>();                                      // bit stream
        Append(bits, 0b0100, 4);                                          // byte mode indicator
        Append(bits, data.Length, version < 10 ? 8 : 16);                 // character count
        foreach (byte b in data) Append(bits, b, 8);                      // payload
        int capacity = DataCodewords(version) * 8;                        // data bits available
        Append(bits, 0, Math.Min(4, capacity - bits.Count));              // terminator
        Append(bits, 0, (8 - bits.Count % 8) % 8);                        // byte align
        for (int pad = 0xEC; bits.Count < capacity; pad ^= 0xEC ^ 0x11) Append(bits, pad, 8); // 0xEC 0x11 padding

        var codewords = new byte[bits.Count / 8];                         // pack bits into bytes
        for (int i = 0; i < bits.Count; i++) if (bits[i]) codewords[i >> 3] |= (byte)(1 << (7 - (i & 7)));

        var qr = new Grid(version);                                       // module matrix
        qr.DrawFunctionPatterns();                                        // finders, timing, alignment, version
        qr.DrawCodewords(AddEccAndInterleave(codewords, version));        // zig-zag data placement

        if (mask < 0)                                                     // choose the lowest penalty mask
        {
            int best = 0, bestPenalty = int.MaxValue;
            for (int m = 0; m < 8; m++)
            {
                qr.ApplyMask(m);                                          // try it
                qr.DrawFormatBits(m);
                int penalty = qr.Penalty();                               // score
                if (penalty < bestPenalty) { best = m; bestPenalty = penalty; }
                qr.ApplyMask(m);                                          // XOR undoes it
            }
            mask = best;
        }
        qr.ApplyMask(mask);                                               // final mask
        qr.DrawFormatBits(mask);                                          // format info for that mask
        return qr.Modules;
    }

    // Builds a point-filtered black/white texture with one pixel per module (no quiet zone, like qrcode.js).
    public static Texture2D ToTexture(bool[,] modules)
    {
        int n = modules.GetLength(0);                                     // modules per side
        var texture = new Texture2D(n, n, TextureFormat.RGBA32, false) { filterMode = FilterMode.Point, wrapMode = TextureWrapMode.Clamp };
        var pixels = new Color32[n * n];                                  // y up in textures
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++)
                pixels[(n - 1 - r) * n + c] = modules[r, c] ? new Color32(0, 0, 0, 255) : new Color32(255, 255, 255, 255); // colorDark / colorLight
        texture.SetPixels32(pixels);                                      // upload
        texture.Apply(false, false);
        return texture;
    }

    // ── Capacity ─────────────────────────────────────────────

    // Data modules of a version after removing every function pattern.
    static int RawDataModules(int version)
    {
        int result = (16 * version + 128) * version + 64;                 // all modules minus finders and timing
        if (version >= 2)
        {
            int align = version / 7 + 2;                                  // alignment patterns per side
            result -= (25 * align - 10) * align - 55;                     // alignment patterns and their overlap with timing
            if (version >= 7) result -= 36;                               // two version information blocks
        }
        return result;
    }

    // Data codewords (excluding error correction) for level M.
    static int DataCodewords(int version)
    {
        return RawDataModules(version) / 8 - EccPerBlock[version] * EccBlocks[version]; // total minus ECC
    }

    // Appends the low `count` bits of value, most significant first.
    static void Append(List<bool> bits, int value, int count)
    {
        for (int i = count - 1; i >= 0; i--) bits.Add(((value >> i) & 1) != 0); // big-endian bits
    }

    // ── Reed-Solomon ─────────────────────────────────────────

    // Splits data into blocks, adds Reed-Solomon codewords and interleaves them.
    static byte[] AddEccAndInterleave(byte[] data, int version)
    {
        int numBlocks = EccBlocks[version], eccLen = EccPerBlock[version];   // block structure
        int raw = RawDataModules(version) / 8;                               // total codewords
        int numShort = numBlocks - raw % numBlocks;                          // blocks with one data byte less
        int shortLen = raw / numBlocks;                                      // short block length incl. ECC
        byte[] divisor = Divisor(eccLen);                                    // generator polynomial

        var blocks = new List<byte[]>();                                     // each block padded to the long length
        for (int i = 0, k = 0; i < numBlocks; i++)
        {
            int dataLen = shortLen - eccLen + (i < numShort ? 0 : 1);        // data bytes in this block
            var block = new byte[shortLen + 1];                              // room for the long length
            Array.Copy(data, k, block, 0, dataLen);                          // data part
            k += dataLen;
            byte[] ecc = Remainder(data, k - dataLen, dataLen, divisor);     // ECC part
            Array.Copy(ecc, 0, block, shortLen + 1 - eccLen, eccLen);        // ECC goes at the end
            blocks.Add(block);
        }

        var result = new List<byte>(raw);                                    // interleaved stream
        for (int i = 0; i < shortLen + 1; i++)
            for (int j = 0; j < numBlocks; j++)
                if (i != shortLen - eccLen || j >= numShort) result.Add(blocks[j][i]); // skip the short blocks' padding slot
        return result.ToArray();
    }

    // Reed-Solomon generator polynomial of the given degree (coefficients from highest to lowest, leading 1 dropped).
    static byte[] Divisor(int degree)
    {
        var result = new byte[degree];                                       // starts as x^0
        result[degree - 1] = 1;
        int root = 1;                                                        // alpha^0
        for (int i = 0; i < degree; i++)
        {
            for (int j = 0; j < degree; j++)                                 // multiply by (x - alpha^i)
            {
                result[j] = Multiply(result[j], root);
                if (j + 1 < degree) result[j] ^= result[j + 1];
            }
            root = Multiply(root, 0x02);                                     // next power of alpha
        }
        return result;
    }

    // Remainder of the data polynomial divided by the generator (the ECC codewords).
    static byte[] Remainder(byte[] data, int offset, int length, byte[] divisor)
    {
        var result = new byte[divisor.Length];                               // running remainder
        for (int i = 0; i < length; i++)
        {
            int factor = data[offset + i] ^ result[0];                       // leading term
            Array.Copy(result, 1, result, 0, result.Length - 1);             // shift left
            result[result.Length - 1] = 0;
            for (int j = 0; j < result.Length; j++) result[j] ^= Multiply(divisor[j], factor); // subtract
        }
        return result;
    }

    // Multiplication in GF(2^8) modulo x^8 + x^4 + x^3 + x^2 + 1.
    static byte Multiply(int x, int y)
    {
        int z = 0;                                                           // Russian peasant multiplication
        for (int i = 7; i >= 0; i--)
        {
            z = (z << 1) ^ ((z >> 7) * 0x11D);                               // reduce
            z ^= ((y >> i) & 1) * x;                                         // add
        }
        return (byte)z;
    }

    // ── Module grid ──────────────────────────────────────────

    // Module matrix plus the mask of function modules that data and masks must not touch.
    class Grid
    {
        public readonly bool[,] Modules;   // [row, column] dark modules
        readonly bool[,] _function;        // [row, column] function pattern modules
        readonly int _version;             // 1..40
        readonly int _size;                // modules per side

        // Allocates an empty grid for a version.
        public Grid(int version)
        {
            _version = version;            // version number
            _size = version * 4 + 17;      // side length
            Modules = new bool[_size, _size];
            _function = new bool[_size, _size];
        }

        // Sets a function module (x = column, y = row).
        void SetFunction(int x, int y, bool dark)
        {
            Modules[y, x] = dark;          // color
            _function[y, x] = true;        // reserved
        }

        // Timing, finders, alignment, format placeholders and version information.
        public void DrawFunctionPatterns()
        {
            for (int i = 0; i < _size; i++) { SetFunction(6, i, i % 2 == 0); SetFunction(i, 6, i % 2 == 0); } // timing
            DrawFinder(3, 3); DrawFinder(_size - 4, 3); DrawFinder(3, _size - 4);                      // three finders
            int[] align = AlignmentPositions();                                                         // alignment centers
            int n = align.Length;
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (!(i == 0 && j == 0 || i == 0 && j == n - 1 || i == n - 1 && j == 0)) DrawAlignment(align[i], align[j]); // skip finder corners
            DrawFormatBits(0);                                                                          // reserve format areas
            DrawVersion();                                                                              // versions 7+
        }

        // 7x7 finder with its 1-module separator.
        void DrawFinder(int x, int y)
        {
            for (int dy = -4; dy <= 4; dy++)
                for (int dx = -4; dx <= 4; dx++)
                {
                    int dist = Math.Max(Math.Abs(dx), Math.Abs(dy));                                   // Chebyshev ring
                    int xx = x + dx, yy = y + dy;
                    if (xx >= 0 && xx < _size && yy >= 0 && yy < _size) SetFunction(xx, yy, dist != 2 && dist != 4);
                }
        }

        // 5x5 alignment pattern.
        void DrawAlignment(int x, int y)
        {
            for (int dy = -2; dy <= 2; dy++)
                for (int dx = -2; dx <= 2; dx++)
                    SetFunction(x + dx, y + dy, Math.Max(Math.Abs(dx), Math.Abs(dy)) != 1);           // dark border and center
        }

        // Alignment pattern center coordinates for the version.
        int[] AlignmentPositions()
        {
            if (_version == 1) return new int[0];                                                      // none
            int count = _version / 7 + 2;                                                              // per side
            int step = _version == 32 ? 26 : (_version * 4 + count * 2 + 1) / (count * 2 - 2) * 2;     // spacing
            var result = new int[count];
            result[0] = 6;                                                                             // first is always 6
            for (int i = count - 1, pos = _size - 7; i >= 1; i--, pos -= step) result[i] = pos;        // from the far edge
            return result;
        }

        // 15-bit format information (level M + mask) in both copies, plus the dark module.
        public void DrawFormatBits(int mask)
        {
            int data = EccFormatBitsM << 3 | mask;                                                     // 5 data bits
            int rem = data;
            for (int i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537);                      // BCH(15,5)
            int bits = (data << 10 | rem) ^ 0x5412;                                                    // masked format word
            bool Bit(int i) => ((bits >> i) & 1) != 0;

            for (int i = 0; i <= 5; i++) SetFunction(8, i, Bit(i));                                    // first copy
            SetFunction(8, 7, Bit(6));
            SetFunction(8, 8, Bit(7));
            SetFunction(7, 8, Bit(8));
            for (int i = 9; i < 15; i++) SetFunction(14 - i, 8, Bit(i));
            for (int i = 0; i < 8; i++) SetFunction(_size - 1 - i, 8, Bit(i));                         // second copy
            for (int i = 8; i < 15; i++) SetFunction(8, _size - 15 + i, Bit(i));
            SetFunction(8, _size - 8, true);                                                           // always dark
        }

        // 18-bit version information blocks (versions 7 and up).
        void DrawVersion()
        {
            if (_version < 7) return;                                                                  // not present
            int rem = _version;
            for (int i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >> 11) * 0x1F25);                    // BCH(18,6)
            int bits = _version << 12 | rem;
            for (int i = 0; i < 18; i++)
            {
                bool bit = ((bits >> i) & 1) != 0;
                int a = _size - 11 + i % 3, b = i / 3;                                                 // 3x6 blocks
                SetFunction(a, b, bit);                                                                // top right
                SetFunction(b, a, bit);                                                                // bottom left
            }
        }

        // Places the codeword bits in the two-column zig-zag, skipping function modules.
        public void DrawCodewords(byte[] data)
        {
            int i = 0;                                                                                 // bit index
            for (int right = _size - 1; right >= 1; right -= 2)
            {
                if (right == 6) right = 5;                                                             // skip the vertical timing column
                for (int vert = 0; vert < _size; vert++)
                    for (int j = 0; j < 2; j++)
                    {
                        int x = right - j;                                                             // column in the pair
                        bool upward = ((right + 1) & 2) == 0;                                          // direction alternates
                        int y = upward ? _size - 1 - vert : vert;                                      // row
                        if (_function[y, x] || i >= data.Length * 8) continue;                         // reserved or remainder bits
                        Modules[y, x] = ((data[i >> 3] >> (7 - (i & 7))) & 1) != 0;
                        i++;
                    }
            }
        }

        // XORs one of the eight mask patterns onto the data modules (applying twice undoes it).
        public void ApplyMask(int mask)
        {
            for (int y = 0; y < _size; y++)
                for (int x = 0; x < _size; x++)
                {
                    if (_function[y, x]) continue;                                                     // masks skip function modules
                    bool invert;
                    switch (mask)
                    {
                        case 0: invert = (x + y) % 2 == 0; break;
                        case 1: invert = y % 2 == 0; break;
                        case 2: invert = x % 3 == 0; break;
                        case 3: invert = (x + y) % 3 == 0; break;
                        case 4: invert = (x / 3 + y / 2) % 2 == 0; break;
                        case 5: invert = x * y % 2 + x * y % 3 == 0; break;
                        case 6: invert = (x * y % 2 + x * y % 3) % 2 == 0; break;
                        default: invert = ((x + y) % 2 + x * y % 3) % 2 == 0; break;
                    }
                    if (invert) Modules[y, x] = !Modules[y, x];
                }
        }

        // Penalty score of the current matrix (runs, 2x2 blocks, finder-like patterns, dark balance).
        public int Penalty()
        {
            int result = 0, dark = 0;
            for (int pass = 0; pass < 2; pass++)                                                       // rows, then columns
                for (int a = 0; a < _size; a++)
                {
                    int run = 1;                                                                       // same-color run
                    for (int b = 1; b <= _size; b++)
                    {
                        bool same = b < _size && At(pass, a, b) == At(pass, a, b - 1);
                        if (same) { run++; continue; }
                        if (run >= 5) result += 3 + (run - 5);                                         // N1
                        run = 1;
                    }
                    for (int b = 0; b + 10 < _size + 4; b++)                                           // N3 with light margins
                        if (FinderLike(pass, a, b)) result += 40;
                }
            for (int y = 0; y < _size; y++)
                for (int x = 0; x < _size; x++)
                {
                    if (Modules[y, x]) dark++;                                                         // N4 count
                    if (x + 1 < _size && y + 1 < _size)
                    {
                        bool c = Modules[y, x];                                                        // N2 block
                        if (c == Modules[y, x + 1] && c == Modules[y + 1, x] && c == Modules[y + 1, x + 1]) result += 3;
                    }
                }
            int total = _size * _size;
            int k = (Math.Abs(dark * 20 - total * 10) + total - 1) / total - 1;                        // deviation from 50 % in 5 % steps
            return result + Math.Max(k, 0) * 10;
        }

        // Module along a row (pass 0) or a column (pass 1); outside the grid counts as light.
        bool At(int pass, int line, int index)
        {
            if (index < 0 || index >= _size) return false;                                             // quiet zone
            return pass == 0 ? Modules[line, index] : Modules[index, line];
        }

        // dark-light-dark-dark-dark-light-dark with four light modules on one side (1:1:3:1:1 finder look-alike).
        bool FinderLike(int pass, int line, int start)
        {
            int s = start - 4;                                                                         // window may begin in the margin
            bool core = At(pass, line, s + 4) && !At(pass, line, s + 5) && At(pass, line, s + 6) && At(pass, line, s + 7)
                && At(pass, line, s + 8) && !At(pass, line, s + 9) && At(pass, line, s + 10);
            if (!core) return false;
            bool before = !At(pass, line, s) && !At(pass, line, s + 1) && !At(pass, line, s + 2) && !At(pass, line, s + 3);
            bool after = !At(pass, line, s + 11) && !At(pass, line, s + 12) && !At(pass, line, s + 13) && !At(pass, line, s + 14);
            return before || after;
        }
    }
}
