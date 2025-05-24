#version 150
#include "/lib/lygia/filter/edge.glsl"
#include "/lib/lygia/filter/gaussianBlur.glsl"

uniform sampler2D DiffuseSampler;   // current color buffer
in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec4 col  = texture(DiffuseSampler, texCoord);
    vec3 edge = edge(DiffuseSampler, texCoord).rgb;     // Sobel-like gradient
    vec3 blur = gaussianBlur(DiffuseSampler, texCoord, 1.5).rgb;

    // Glow: keep only blurred colour where edge intensity is high
    float e = clamp(length(edge) * 3.0, 0.0, 1.0);
    vec3  glow = blur * e;

    fragColor = vec4(col.rgb + glow, col.a);
}
