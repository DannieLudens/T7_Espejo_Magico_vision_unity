Shader "Custom/WaterRippleEffect"
{
    Properties
    {
        _MainTex       ("Camera Texture",  2D) = "white" {}
        _CurrentBuffer ("Current Buffer",  2D) = "black" {}
        _PrevBuffer    ("Previous Buffer", 2D) = "black" {}
        _Damping       ("Damping",         Range(0.9, 0.999)) = 0.97
        _RippleStr     ("Ripple Strength", Range(0.0, 0.05))  = 0.02
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" }
        ZWrite Off ZTest Always Cull Off

        // Pass 0 - propagar ondas
        Pass
        {
            Name "PROPAGATE"
            CGPROGRAM
            #pragma vertex vert_img
            #pragma fragment frag_prop
            #include "UnityCG.cginc"

            sampler2D _CurrentBuffer;
            sampler2D _PrevBuffer;
            float4    _CurrentBuffer_TexelSize;
            float     _Damping;

            fixed4 frag_prop(v2f_img i) : SV_Target
            {
                float2 uv = i.uv;
                float2 tx = _CurrentBuffer_TexelSize.xy;
                float cur  = tex2D(_CurrentBuffer, uv).r;
                float prev = tex2D(_PrevBuffer,    uv).r;
                float n = tex2D(_CurrentBuffer, uv + float2(0,  tx.y)).r;
                float s = tex2D(_CurrentBuffer, uv + float2(0, -tx.y)).r;
                float e = tex2D(_CurrentBuffer, uv + float2( tx.x, 0)).r;
                float w = tex2D(_CurrentBuffer, uv + float2(-tx.x, 0)).r;
                float next = ((n + s + e + w) * 0.5 - prev) * _Damping;
                next = clamp(next, -1.0, 1.0);
                return fixed4(next, next, next, 1);
            }
            ENDCG
        }

        // Pass 1 - renderizar con distorsion
        Pass
        {
            Name "RENDER"
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            sampler2D _MainTex;
            float4    _MainTex_ST;
            sampler2D _CurrentBuffer;
            float4    _CurrentBuffer_TexelSize;
            float     _RippleStr;

            struct appdata { float4 vertex : POSITION; float2 uv : TEXCOORD0; };
            struct v2f    { float4 pos : SV_POSITION;  float2 uv : TEXCOORD0; };

            v2f vert(appdata v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                o.uv  = v.uv;
                return o;
            }

            fixed4 frag(v2f i) : SV_Target
            {
                float2 uv = i.uv;
                float2 tx = _CurrentBuffer_TexelSize.xy;

                float hR = tex2D(_CurrentBuffer, uv + float2( tx.x, 0)).r;
                float hL = tex2D(_CurrentBuffer, uv - float2( tx.x, 0)).r;
                float hU = tex2D(_CurrentBuffer, uv + float2(0,  tx.y)).r;
                float hD = tex2D(_CurrentBuffer, uv - float2(0,  tx.y)).r;

                float2 grad   = float2(hR - hL, hU - hD);
                float2 distUV = clamp(uv + grad * _RippleStr, 0.001, 0.999);

                return tex2D(_MainTex, distUV);
            }
            ENDCG
        }
    }
}
