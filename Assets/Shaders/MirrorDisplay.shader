// Draws the mirrored webcam refracted by the wave heights (port of _FRAG_DISP in js/magic-mirror.js).
// The web flips the camera vertically because WebGL uploads video top-down; Unity textures are bottom-up,
// so the same displacement is applied with the opposite sign on y.
Shader "Hidden/EspejoMagico/MirrorDisplay"
{
    Properties
    {
        _MainTex ("Camera", 2D) = "black" {} // uCamera
        _Wave ("Wave heights", 2D) = "black" {} // uWave
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

            sampler2D _MainTex;   // uCamera
            sampler2D _Wave;      // uWave
            float4 _SimTexel;     // (1/SIM_W, 1/SIM_H, WORK_W, WORK_H)
            float _Disp;          // uDisp
            float _Tint;          // uTint

            // Samples the camera with the wave gradient as an offset and adds the blue tint on strong waves.
            fixed4 frag(v2f_img i) : SV_Target
            {
                float hR = tex2D(_Wave, i.uv + float2(_SimTexel.x, 0)).r; // right
                float hL = tex2D(_Wave, i.uv - float2(_SimTexel.x, 0)).r; // left
                float hD = tex2D(_Wave, i.uv + float2(0, _SimTexel.y)).r; // above (GL y up, same as the web FBO)
                float hU = tex2D(_Wave, i.uv - float2(0, _SimTexel.y)).r; // below

                float dx = (hR - hL) * _Disp; // horizontal gradient
                float dy = (hD - hU) * _Disp; // vertical gradient

                float2 camUV = float2(1.0 - i.uv.x + dx / _SimTexel.z,   // mirrored like the web
                                      i.uv.y - dy / _SimTexel.w);         // web adds dy in top-down space
                camUV = saturate(camUV);                                  // clamp(camUV, 0, 1)
                fixed4 color = tex2D(_MainTex, camUV);                    // webcam pixel

                if (_Tint > 0.0)
                {
                    float mag = abs(dx) + abs(dy);                        // wave strength
                    if (mag > 1.5)
                    {
                        float t = min(_Tint, (mag - 1.5) / 20.0 * _Tint); // tint amount
                        color.rgb = lerp(color.rgb, float3(0.706, 0.784, 0.902), t); // rgb(180, 200, 230)
                    }
                }
                color.a = 1.0; // opaque canvas (alpha: false)
                return color;
            }
            ENDCG
        }
    }
}
