#version 150
uniform sampler2D DiffuseSampler;
uniform vec2      uMotion;  
uniform float     uStrength;  

in  vec2 texCoord;
out vec4 fragColor;

void main() {
    vec2 dir = normalize(uMotion);
    float spd = length(uMotion);
    vec4 sum  = texture(DiffuseSampler, texCoord);
    float samples = 6.0;
    for (float i = 1.0; i <= samples; i++) {
        vec2 off = dir * (i / samples) * spd / OutSize * 3.0;
        sum += texture(DiffuseSampler, texCoord - off);
    }
    sum /= (samples + 1.0);
    fragColor = vec4(sum.rgb, sum.a * uStrength);
}
