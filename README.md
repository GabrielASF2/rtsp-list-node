# RTSP LIST

Ferramento para auxiliar a adição de usuários em sistemas de monitoramento.
Gera protocolos GID, SID e protocolos RTSP a partir de um CSV e/ou um JSON

O CSV deve conter esses HEADERS:

Código | Nome | Fabricante | Modelo | IP | Porta | Usuário | Senha | CtidReceptora | CamerasAtivas

O JSON: 

```json
[
    {
        "code": String,
        "brand": String,
        "model": String,
        "addr": String,
        "port": Int,
        "user": String,
        "pwd": String,
        "ctid": Int,
        "camerasAtivas": Int, 
    },
]

```

