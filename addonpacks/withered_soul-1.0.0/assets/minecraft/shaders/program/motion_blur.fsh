#version 150
uniform sampler2D DiffuseSampler;   // fully rendered frame (after glow)
uniform sampler2D PrevFrame;        // previous frame texture
uniform float MixFactor;            // 0 = crisp, 1 = very blurry
in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec3 now  = texture(DiffuseSampler, texCoord).rgb;
    vec3 prev = texture(PrevFrame,     texCoord).rgb;
    fragColor = vec4(mix(now, prev, MixFactor), 1.0);
}
