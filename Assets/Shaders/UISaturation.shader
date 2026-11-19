// UI/Default plus a saturation control, to reproduce CSS filter: saturate(x) on UI images.
// CSS brightness(x) is applied through the Image color (vertex color multiply).
Shader "EspejoMagico/UI/Saturation"
{
    Properties
    {
        [PerRendererData] _MainTex ("Sprite Texture", 2D) = "white" {}
        _Color ("Tint", Color) = (1,1,1,1)
        _Saturation ("Saturation", Range(0, 2)) = 1

        _StencilComp ("Stencil Comparison", Float) = 8
        _Stencil ("Stencil ID", Float) = 0
        _StencilOp ("Stencil Operation", Float) = 0
        _StencilWriteMask ("Stencil Write Mask", Float) = 255
        _StencilReadMask ("Stencil Read Mask", Float) = 255
        _ColorMask ("Color Mask", Float) = 15

        [Toggle(UNITY_UI_ALPHACLIP)] _UseUIAlphaClip ("Use Alpha Clip", Float) = 0
    }

    SubShader
    {
        Tags
        {
            "Queue"="Transparent"
            "IgnoreProjector"="True"
            "RenderType"="Transparent"
            "PreviewType"="Plane"
            "CanUseSpriteAtlas"="True"
        }

        Stencil // lets UI Mask clip this image (presenter card ovals)
        {
            Ref [_Stencil]
            Comp [_StencilComp]
            Pass [_StencilOp]
            ReadMask [_StencilReadMask]
            WriteMask [_StencilWriteMask]
        }

        Cull Off
        Lighting Off
        ZWrite Off
        ZTest [unity_GUIZTestMode]
        Blend One OneMinusSrcAlpha // premultiplied output, same as UI/Default
        ColorMask [_ColorMask]

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 2.0

            #include "UnityCG.cginc"
            #include "UnityUI.cginc"

            #pragma multi_compile_local _ UNITY_UI_CLIP_RECT
            #pragma multi_compile_local _ UNITY_UI_ALPHACLIP

            struct appdata_t
            {
                float4 vertex   : POSITION;  // mesh position
                float4 color    : COLOR;     // Image.color (also carries CSS brightness)
                float2 texcoord : TEXCOORD0; // sprite UV
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct v2f
            {
                float4 vertex        : SV_POSITION; // clip position
                fixed4 color         : COLOR;       // tint
                float2 texcoord      : TEXCOORD0;   // sprite UV
                float4 worldPosition : TEXCOORD1;   // for RectMask2D clipping
                UNITY_VERTEX_OUTPUT_STEREO
            };

            sampler2D _MainTex;        // sprite texture
            fixed4 _Color;             // material tint
            fixed4 _TextureSampleAdd;  // font/alpha texture support
            float4 _ClipRect;          // RectMask2D rect
            float4 _MainTex_ST;        // tiling/offset
            float _Saturation;         // CSS saturate() amount

            // Standard UI vertex transform.
            v2f vert (appdata_t v)
            {
                v2f o;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                o.worldPosition = v.vertex;                         // keep object position for clipping
                o.vertex = UnityObjectToClipPos(v.vertex);          // to clip space
                o.texcoord = TRANSFORM_TEX(v.texcoord, _MainTex);   // apply tiling
                o.color = v.color * _Color;                         // combine tints
                return o;
            }

            // Samples the sprite, blends toward grey like CSS saturate(), then tints and premultiplies.
            fixed4 frag (v2f i) : SV_Target
            {
                half4 c = tex2D(_MainTex, i.texcoord) + _TextureSampleAdd;      // sprite color
                half grey = dot(c.rgb, half3(0.2126, 0.7152, 0.0722));          // luminance (CSS filter coefficients)
                c.rgb = lerp(grey.xxx, c.rgb, _Saturation);                     // 0 = grey, 1 = original
                c *= i.color;                                                   // brightness and opacity

                #ifdef UNITY_UI_CLIP_RECT
                c.a *= UnityGet2DClipping(i.worldPosition.xy, _ClipRect);      // RectMask2D
                #endif

                #ifdef UNITY_UI_ALPHACLIP
                clip(c.a - 0.001);                                              // hard alpha clip when requested
                #endif

                c.rgb *= c.a; // premultiply for Blend One OneMinusSrcAlpha
                return c;
            }
            ENDCG
        }
    }
}
