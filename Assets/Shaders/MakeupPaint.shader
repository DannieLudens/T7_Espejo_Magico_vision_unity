// Paints the makeup overlay into a render texture (port of the canvas 2D drawing in js/face-filter.js).
// Vertex colors arrive premultiplied, so gradients interpolate like canvas radial gradients do.
Shader "Hidden/EspejoMagico/MakeupPaint"
{
    SubShader
    {
        Tags { "Queue" = "Transparent" "RenderType" = "Transparent" }
        Cull Off          // polygons may wind either way
        ZWrite Off        // 2D overlay, no depth
        ZTest Always      // always draw
        Blend One OneMinusSrcAlpha // source-over with premultiplied alpha

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION; // pixel-space position (GL.LoadPixelMatrix)
                float4 color : COLOR;     // premultiplied rgba
            };

            struct v2f
            {
                float4 pos : SV_POSITION; // clip-space position
                float4 color : COLOR;     // interpolated color
            };

            // Transforms the vertex and forwards its color.
            v2f vert(appdata v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex); // GL matrices
                o.color = v.color;                      // premultiplied
                return o;
            }

            // Outputs the interpolated premultiplied color.
            fixed4 frag(v2f i) : SV_Target
            {
                return i.color; // already premultiplied
            }
            ENDCG
        }
    }
}
