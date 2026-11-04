export class ApplicationLifecycle {
  private shuttingDown = false;

  //Flag para indicar se a aplicação está em processo de desligamento. Isso é útil para evitar que novas requisições sejam processadas durante o desligamento.
  public isShuttingDown(): boolean {
    return this.shuttingDown;
  }

  // Método para iniciar o processo de desligamento da aplicação. Isso pode ser chamado, por exemplo, quando o servidor recebe um sinal de encerramento.
  public beginShutdown(): void {
    this.shuttingDown = true;
  }
}
