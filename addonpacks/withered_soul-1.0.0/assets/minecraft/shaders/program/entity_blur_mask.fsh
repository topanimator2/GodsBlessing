#version 150
uniform sampler2D DiffuseSampler;
in  vec2 texCoord;
out vec4 fragColor;
void main() {        // copy source → alpha; RGB unused in this pass
    vec4 px   = texture(DiffuseSampler, texCoord);
    fragColor = vec4(0.0, 0.0, 0.0, px.a);
}