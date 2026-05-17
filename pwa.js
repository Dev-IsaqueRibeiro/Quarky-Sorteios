// 1. Registro do Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => console.log("Service Worker Registrado!"))
      .catch((err) => console.log("Erro no SW:", err));
  });
}

let deferredPrompt;

// 2. Aguarda o DOM estar pronto para buscar o botão
window.addEventListener("DOMContentLoaded", () => {
  const installBtn = document.querySelector("#installApp");

  // Log para depuração - Verifique se isso aparece no console!
  console.log("Botão de instalação encontrado:", installBtn);

  if (installBtn) {
    // Garantimos que comece escondido
    installBtn.style.display = "none";

    // 3. Escuta o evento de instalação
    window.addEventListener("beforeinstallprompt", (e) => {
      console.log("✅ Evento beforeinstallprompt disparado!");
      e.preventDefault();
      deferredPrompt = e;
      installBtn.style.display = "flex"; // Só mostra se for instalável
    });

    // 4. Ação do clique
    installBtn.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Usuário escolheu: ${outcome}`);
        deferredPrompt = null;
        installBtn.style.display = "none";
      } else {
        console.log("O prompt ainda não está pronto.");
      }
    });
  }
});
