import Docker from "dockerode"

// direct connection to docker daemon

export const docker = new Docker ({
    // for mac - linux os
    // socketPath: "/var/run/docker.sock",
    
    socketPath: "\\\\.\\pipe\\docker_engine", //windows os
})

