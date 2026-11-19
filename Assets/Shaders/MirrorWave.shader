// One step of the discrete wave equation for the magic mirror (port of _FRAG_WAVE in js/magic-mirror.js).
// Reads the current and previous height fields, writes the next one, injects the finger splash
// and keeps the outer ring of texels at zero (absorbing borders).
Shader "Hidden/EspejoMagico/MirrorWave"
{
    Properties
    {
        _MainTex ("Current heights", 2D) = "black" {} // uCurr
        _Prev ("Previous heights", 2D) = "black" {}   // uPrev
    }
    SubShader
    {
        Cull Off ZWrite Off ZTest Always // full-screen blit

        Pass
        {
            CGPROGRAM
            #pragma vertex vert_img
            #pragma fragment frag
            #include "UnityCG.cginc"

            sampler2D _MainTex;     // uCurr
            sampler2D _Prev;        // uPrev
            float4 _SimSize;        // (W, H, 1/W, 1/H) of the simulation grid
            float _Damping;         // uDamping
            float2 _SplashUV;       // uSplashUV (y up)
            float _SplashF;         // uSplashF
            float _SplashR;         // uSplashR (texels)
            float _HasSplash;       // uHasSplash

            // Computes the next height of one texel.
            float4 frag(v2f_img i) : SV_Target
            {
                float2 px = i.uv * _SimSize.xy;                                                   // texel coordinates
                if (px.x < 1.0 || px.x > _SimSize.x - 1.0 || px.y < 1.0 || px.y > _SimSize.y - 1.0) // absorbing borders
                    return float4(0, 0, 0, 1);

                float prev = tex2D(_Prev, i.uv).r;                          // height one step ago
                float r = tex2D(_MainTex, i.uv + float2(_SimSize.z, 0)).r;  // right neighbour
                float l = tex2D(_MainTex, i.uv - float2(_SimSize.z, 0)).r;  // left neighbour
                float d = tex2D(_MainTex, i.uv + float2(0, _SimSize.w)).r;  // neighbour above
                float u = tex2D(_MainTex, i.uv - float2(0, _SimSize.w)).r;  // neighbour below

                float next = (r + l + d + u) * 0.5 - prev; // wave equation
                next *= _Damping;                          // energy loss

                if (_HasSplash > 0.5)                                       // finger moved this frame
                {
                    float2 delta = (i.uv - _SplashUV) * _SimSize.xy;        // distance in texels
                    if (dot(delta, delta) <= _SplashR * _SplashR) next += _SplashF; // push the water
                }
                return float4(next, 0, 0, 1); // single channel
            }
            ENDCG
        }
    }
}
