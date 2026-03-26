Place planet texture files in these folders. The app already references these exact paths.

Expected structure:

- `sun/map.jpg`
- `sun/emissive.jpg`
- `mercury/map.jpg`
- `mercury/normal.jpg`
- `venus/map.jpg`
- `venus/normal.jpg`
- `venus/clouds.jpg`
- `earth/map.jpg`
- `earth/normal.jpg`
- `earth/roughness.jpg`
- `earth/emissive.jpg`
- `earth/clouds.jpg`
- `mars/map.jpg`
- `mars/normal.jpg`
- `jupiter/map.jpg`
- `saturn/map.jpg`
- `saturn/rings.png`
- `uranus/map.jpg`
- `neptune/map.jpg`

Absolute project path:

`D:\IdeaProjects\protfolio\cosmos-protfolio\cosmos__rajesh_portfolio\public\textures\planets`

The code currently loads textures from:

- `/textures/planets/sun/...`
- `/textures/planets/mercury/...`
- `/textures/planets/venus/...`
- `/textures/planets/earth/...`
- `/textures/planets/mars/...`
- `/textures/planets/jupiter/...`
- `/textures/planets/saturn/...`
- `/textures/planets/uranus/...`
- `/textures/planets/neptune/...`

Recommended sources:

- Solar System Scope for base planet maps
- NASA Visible Earth for Earth maps and clouds

If a texture is missing, the related planet effect may render flat or fail to load depending on the material path used.
