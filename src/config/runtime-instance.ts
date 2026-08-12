export function getRuntimeInstanceName(): string {
    return process.env.INSTANCE_NAME ?? process.env.HOSTNAME ?? 'local';
}
