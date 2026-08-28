import Docker from "dockerode"

// direct connection to docker daemon

const socketPath =
  process.env.DOCKER_SOCKET ||
  (process.platform === "win32"
    ? "\\\\.\\pipe\\docker_engine"
    : "/var/run/docker.sock");

export const docker = new Docker({
  socketPath,
});

