document.addEventListener("DOMContentLoaded", () => {
  // --- REFERÊNCIAS GLOBAIS DO MODAL ---
  const mainOverlay = document.getElementById("overlay");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const closeModalBtn = document.getElementById("close-modal");

  // Variável para controlar se o sorteio está rodando
  let isDrawing = false;

  const closeModal = () => {
    // SÓ FECHA SE NÃO ESTIVER SORTEANDO
    if (isDrawing) return;

    if (mainOverlay) {
      mainOverlay.style.display = "none";
      mainOverlay.classList.remove("active");
    }
  };

  if (closeModalBtn) {
    closeModalBtn.onclick = closeModal;
  }
  window.closeModal = closeModal;

  // --- LIMPEZA AUTOMÁTICA DOS INPUTS ---
  // Seleciona todos os inputs da página e adiciona o evento de limpar ao clicar
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      input.value = "";
    });
  });

  /* 
     =========================================
     1. LÓGICA DO SORTEIO DE CORES
     =========================================
  */
  const spinButton = document.getElementById("spin-button");
  if (spinButton) {
    const colorBox = document.getElementById("color-box");
    const colorResult = document.getElementById("color-result");

    const colors = [
      { name: "Verde", hex: "#008000" },
      { name: "Amarela", hex: "#FFFF00" },
      { name: "Azul", hex: "#0000FF" },
      { name: "Branca", hex: "#FFFFFF" },
      { name: "Rosa", hex: "#F49CBB" },
      { name: "Roxo", hex: "#5A189A" },
      { name: "Laranja", hex: "#EB5E28" },
      { name: "Marrom", hex: "#473335" },
      { name: "Cinza", hex: "#6C757D" },
      { name: "Vermelha", hex: "#C1121F" },
      { name: "Preta", hex: "#000000" },
      { name: "Bege", hex: "#CBBD93" },
    ];

    let isSpinning = false;

    spinButton.addEventListener("click", () => {
      if (isSpinning) return;

      isSpinning = true;
      spinButton.disabled = true;

      colorResult.textContent = "";
      colorResult.style.textShadow = "none";

      let currentIteration = 0;
      const totalIterations = 20;
      let delay = 50;

      function startSpin() {
        const randomIndex = Math.floor(Math.random() * colors.length);
        const selectedColor = colors[randomIndex];

        colorBox.style.backgroundColor = selectedColor.hex;
        colorBox.style.border =
          selectedColor.hex === "#ffffff"
            ? "2px solid #ccc"
            : "2px solid transparent";

        currentIteration++;

        if (currentIteration < totalIterations) {
          delay += 20;
          setTimeout(startSpin, delay);
        } else {
          exibirResultadoFinal(selectedColor);
        }
      }

      function exibirResultadoFinal(winner) {
        colorResult.textContent = winner.name;
        colorResult.style.color = winner.hex;

        if (winner.name.toLowerCase() === "preta" || winner.hex === "#000000") {
          colorResult.style.textShadow = "2px 2px 4px rgba(255, 255, 255, 0.8)";
        } else {
          colorResult.style.textShadow = "2px 2px 3px #000000da";
        }

        colorResult.style.boxShadow = "inset 0 0 75px #fff, 0 0 7px #fff";

        isSpinning = false;
        spinButton.disabled = false;
      }

      startSpin();
    });
  }

  /* 
     =========================================
     2. LÓGICA DO SORTEIO DE NOMES
     =========================================
  */
  const addNameBtn = document.getElementById("add-name-btn");

  if (addNameBtn) {
    const nameInput = document.getElementById("name-input");
    const nameAmountInput = document.getElementById("name-amount");
    const nameListContainer = document.getElementById("name-list-container");
    const drawBtn = document.getElementById("draw-btn");
    const clearBtnContainer = document.getElementById("clear-btn-container");

    let namesArray = [];

    const adjustFontSize = () => {
      const allTags = document.querySelectorAll(
        "#name-list-container .name-tag-item",
      );
      if (allTags.length === 0) return;

      let minFontSize = 16;
      allTags.forEach((tag) => (tag.style.fontSize = "16px"));

      allTags.forEach((tag) => {
        if (tag.scrollWidth > tag.clientWidth) {
          const ratio = tag.clientWidth / tag.scrollWidth;
          const newSize = Math.floor(16 * ratio) - 1;
          if (newSize < minFontSize) minFontSize = newSize;
        }
      });

      allTags.forEach((tag) => {
        tag.style.fontSize = `${minFontSize}px`;
      });
    };

    const showModal = (title, message, isWinner = false) => {
      modalTitle.textContent = title;
      modalMessage.innerHTML = message;
      modalMessage.classList.remove("winner-text");
      if (isWinner) modalMessage.classList.add("winner-text");
      mainOverlay.style.display = "flex";
    };

    const confirmAction = (message, targetName, onConfirm) => {
      const htmlContent = `
        <div style="text-align: center;">
            <p style="margin-bottom: 10px; font-size: 1rem; opacity: 0.9;">${message}</p>
            <p style="margin-bottom: 25px; font-size: 1.6rem; font-weight: 900; color: #c1121f; text-shadow: 0 1px 2px #000000; text-transform: uppercase; letter-spacing: 1px;">
                "${targetName}"
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="confirm-yes" class="confirm-btn confirm-btn-yes">Sim</button>
                <button id="confirm-no" class="confirm-btn confirm-btn-no">Não</button>
            </div>
        </div>`;
      showModal("Confirmação", htmlContent);

      document.getElementById("confirm-yes").onclick = () => {
        onConfirm();
        closeModal();
      };
      document.getElementById("confirm-no").onclick = closeModal;
    };

    const updateClearButton = () => {
      if (!clearBtnContainer) return;
      clearBtnContainer.innerHTML = "";

      if (namesArray.length > 0) {
        const clearBtn = document.createElement("button");
        clearBtn.id = "clear-list-btn";
        clearBtn.innerHTML = "🗑️ Limpar Lista";

        clearBtn.onclick = () =>
          confirmAction(
            "Deseja limpar todos os nomes da lista?",
            "TODA A LISTA",
            () => {
              namesArray = [];
              renderNames();
            },
          );
        clearBtnContainer.appendChild(clearBtn);
      }
    };

    const renderNames = () => {
      nameListContainer.innerHTML = "";
      namesArray.forEach((name, index) => {
        const tag = document.createElement("div");
        tag.className = "name-tag-item";
        tag.textContent = name;

        tag.onclick = () =>
          confirmAction("Deseja remover da lista o nome:", name, () => {
            namesArray.splice(index, 1);
            renderNames();
          });

        nameListContainer.appendChild(tag);
      });

      setTimeout(adjustFontSize, 10);
      updateClearButton();
    };

    addNameBtn.addEventListener("click", () => {
      const targetAmount = parseInt(nameAmountInput.value);
      const name = nameInput.value.trim();

      if (isNaN(targetAmount) || targetAmount <= 0) {
        showModal(
          "⚠️ Campo Obrigatório",
          "Defina primeiro <b>quantos nomes</b> deseja incluir.",
        );
        nameAmountInput.focus();
        return;
      }

      if (namesArray.length >= targetAmount) {
        showModal(
          "Limite Atingido",
          `Você já adicionou os ${targetAmount} nomes definidos.`,
        );
        return;
      }

      if (name) {
        namesArray.push(name);
        renderNames();
        nameInput.value = "";
        nameInput.focus();
      } else {
        showModal("Atenção", "Por favor, digite um nome válido.");
      }
    });

    drawBtn.addEventListener("click", () => {
      const targetAmount = parseInt(nameAmountInput.value);

      if (isNaN(targetAmount) || targetAmount <= 0) {
        showModal(
          "Atenção",
          "Por favor, defina a <b>quantidade de participantes</b> do sorteio.",
        );
        return;
      }

      if (namesArray.length < targetAmount) {
        const faltam = targetAmount - namesArray.length;
        showModal(
          "Lista Incompleta",
          `Adicione todos os ${targetAmount} nomes primeiro.<br>Ainda faltam <b>${faltam}</b> nomes.`,
        );
        return;
      }

      drawBtn.disabled = true;
      let currentIteration = 0;
      const totalIterations = 25;
      let delay = 60;
      const allTags = document.querySelectorAll(
        "#name-list-container .name-tag-item",
      );

      function startNameSpin() {
        allTags.forEach((tag) => tag.classList.remove("active-spin"));
        const randomIndex = Math.floor(Math.random() * namesArray.length);
        allTags[randomIndex].classList.add("active-spin");

        currentIteration++;

        if (currentIteration < totalIterations) {
          delay += 15;
          setTimeout(startNameSpin, delay);
        } else {
          const winnerName = namesArray[randomIndex];
          setTimeout(() => {
            exibirVencedorQuarky(winnerName);
            drawBtn.disabled = false;
          }, 400);
        }
      }

      function exibirVencedorQuarky(name) {
        let htmlContent = '<div class="winner-display">';
        name.split("").forEach((char, index) => {
          const colorClass = index % 2 === 0 ? "orange" : "blue";
          const delayAnim = index * 0.1;
          htmlContent += `<span class="winner-letter ${colorClass}" style="animation-delay: ${delayAnim}s">${char === " " ? "&nbsp;" : char}</span>`;
        });
        htmlContent += "</div>";
        showModal("Temos um Vencedor!", htmlContent, true);
      }

      startNameSpin();
    });
  }

  /* 
     ====================================
     3. LÓGICA DE SORTEIO DE NÚMEROS 
     ==================================== 
  */
  const drawNumberBtn = document.querySelector(".btn-sortNumber");

  if (drawNumberBtn) {
    drawNumberBtn.addEventListener("click", () => {
      const quantityInput = document.getElementById("quantity");
      const minInput = document.getElementById("min");
      const maxInput = document.getElementById("max");

      const quantity = parseInt(quantityInput.value);
      const min = parseInt(minInput.value);
      const max = parseInt(maxInput.value);

      const showWarn = (msg) => {
        modalTitle.textContent = "Atenção";
        modalMessage.innerHTML = msg;
        mainOverlay.style.display = "flex";
        mainOverlay.classList.add("active");
      };

      if (isNaN(quantity) || isNaN(min) || isNaN(max))
        return showWarn("Preencha todos os campos corretamente.");
      if (min >= max)
        return showWarn("O número MÍNIMO deve ser menor que o MÁXIMO.");

      const range = max - min + 1;
      if (quantity > range)
        return showWarn(
          `No intervalo existem apenas ${range} números disponíveis.`,
        );

      modalTitle.textContent = "Sorteando...";
      modalMessage.innerHTML = `
        <p id="result-phrase" style="margin-bottom: 10px; font-weight: bold;"></p>
        <div id="number-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(65px, 1fr)); gap: 12px; justify-items: center;"></div>
      `;

      const grid = document.getElementById("number-grid");
      const phraseElement = document.getElementById("result-phrase");

      for (let i = min; i <= max; i++) {
        const numTag = document.createElement("div");
        numTag.className = "name-tag-item";
        numTag.style.width = "60px";
        numTag.style.height = "45px";
        numTag.style.display = "flex";
        numTag.style.alignItems = "center";
        numTag.style.justifyContent = "center";
        numTag.style.margin = "0";
        numTag.id = `num-${i}`;
        numTag.textContent = i;
        grid.appendChild(numTag);
      }

      mainOverlay.style.display = "flex";
      mainOverlay.classList.add("active");

      let currentIteration = 0;
      const totalIterations = 25;
      let delay = 60;
      const allTags = grid.querySelectorAll(".name-tag-item");

      function runRoleta() {
        allTags.forEach((tag) => tag.classList.remove("active-spin"));
        const randomIndex = Math.floor(Math.random() * allTags.length);
        allTags[randomIndex].classList.add("active-spin");

        if (++currentIteration < totalIterations) {
          delay += currentIteration * 1.5;
          setTimeout(runRoleta, delay);
        } else {
          const sorteados = [];
          while (sorteados.length < quantity) {
            const n = Math.floor(Math.random() * range) + min;
            if (!sorteados.includes(n)) sorteados.push(n);
          }

          allTags.forEach((tag) => tag.classList.remove("active-spin"));
          modalTitle.textContent = "Resultado Final";

          phraseElement.textContent =
            quantity === 1
              ? "O Número Sorteado Foi:"
              : "Os Números Sorteados Foram:";

          sorteados.forEach((num) => {
            const winnerTag = document.getElementById(`num-${num}`);
            if (winnerTag) {
              winnerTag.classList.add("winner-number-highlight");
            }
          });
        }
      }

      setTimeout(runRoleta, 400);
    });
  }

  /* 
     =====================================
     4. LÓGICA DO SORTEIO DE EQUIPES
     ===================================== 
  */
  const teamQtyInput = document.getElementById("team-quantity");
  const teamNameInput = document.getElementById("team-name");
  const colorBtns = document.querySelectorAll(".color-btn");
  const teamListContainer = document.getElementById("team-list");

  const partQtyInput = document.getElementById("participant-quantity");
  const partNameInput = document.getElementById("participant-name");
  const addPartBtn = document.getElementById("add-participant-btn");
  const partListContainer = document.getElementById("participant-list");

  const drawTeamsBtn = document.getElementById("draw-btn");

  let teamsData = [];
  let participantsArray = [];
  let selectedColor = null;

  const triggerModal = (title, msg) => {
    modalTitle.textContent = title;
    modalMessage.innerHTML = msg;
    mainOverlay.style.display = "flex";
    mainOverlay.classList.add("active");
  };

  colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("disabled")) return;
      colorBtns.forEach((b) => b.classList.remove("selected-now"));
      btn.classList.add("selected-now");
      selectedColor = btn.getAttribute("data-color");
    });
  });

  // Alterado para atribuição direta via JS ao invés de depender apenas do escopo global puro do HTML
  window.addTeam = () => {
    const maxTeams = parseInt(teamQtyInput.value);
    const tName = teamNameInput.value.trim();

    if (isNaN(maxTeams) || maxTeams < 2)
      return triggerModal("Atenção", "Defina no mínimo 2 equipes.");
    if (!tName) return triggerModal("Atenção", "Digite o nome da equipe.");
    if (!selectedColor)
      return triggerModal("Atenção", "Escolha uma cor para a equipe.");

    if (teamsData.some((t) => t.name.toLowerCase() === tName.toLowerCase())) {
      return triggerModal("Erro", "Este nome de equipe já está em uso.");
    }

    if (teamsData.length >= maxTeams) {
      return triggerModal(
        "Limite atingido",
        `Você definiu o máximo de ${maxTeams} equipes.`,
      );
    }

    teamsData.push({ name: tName, color: selectedColor });

    const btnToDisable = document.querySelector(
      `.color-btn[data-color="${selectedColor}"]`,
    );
    if (btnToDisable) {
      btnToDisable.classList.add("disabled");
      btnToDisable.classList.remove("selected-now");
    }
    selectedColor = null;

    renderTeams();
    teamNameInput.value = "";
    teamNameInput.focus();
  };

  const renderTeams = () => {
    teamListContainer.innerHTML = "";
    teamsData.forEach((team, index) => {
      const div = document.createElement("div");
      div.className = "name-tag-item";
      div.style.color = "#ffffff";
      div.style.boxShadow = `inset 0 0 15px ${team.color}`;
      div.style.border = `1px solid ${team.color}`;
      div.innerHTML = `<span>${team.name}</span>`;

      // SUBSTITUÍDO: Agora usa o modal do app para confirmar exclusão
      div.onclick = () => {
        const htmlContent = `
        <div style="text-align: center;">
            <p style="margin-bottom: 10px; opacity: 0.9;">Deseja remover a equipe:</p>
            <p style="margin-bottom: 25px; font-size: 1.4rem; font-weight: 900; color: #c1121f; text-transform: uppercase;">
              "${team.name}"
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="confirm-team-yes" class="confirm-btn confirm-btn-yes">Sim</button>
                <button id="confirm-team-no" class="confirm-btn confirm-btn-no">Não</button>
            </div>
        </div>`;

        triggerModal("Confirmação", htmlContent);

        document.getElementById("confirm-team-yes").onclick = () => {
          const btnColor = document.querySelector(
            `.color-btn[data-color="${team.color}"]`,
          );
          if (btnColor) btnColor.classList.remove("disabled");
          teamsData.splice(index, 1);
          renderTeams();
          closeModal(); // Fecha o modal após deletar
        };
        document.getElementById("confirm-team-no").onclick = closeModal;
      };
      teamListContainer.appendChild(div);
    });
  };

  if (addPartBtn) {
    addPartBtn.addEventListener("click", () => {
      const totalParts = parseInt(partQtyInput.value);
      const pName = partNameInput.value.trim();

      if (isNaN(totalParts) || totalParts < 2)
        return triggerModal(
          "Atenção",
          "Defina o total de participantes válidos.",
        );
      if (!pName)
        return triggerModal("Atenção", "Digite o nome do participante.");

      if (participantsArray.length >= totalParts) {
        return triggerModal(
          "Limite",
          `Número total de ${totalParts} participantes atingido.`,
        );
      }

      if (
        participantsArray.some(
          (name) => name.toLowerCase() === pName.toLowerCase(),
        )
      ) {
        return triggerModal("Erro", `O nome "${pName}" já foi adicionado.`);
      }

      participantsArray.push(pName);
      renderParticipants();
      partNameInput.value = "";
      partNameInput.focus();
    });
  }

  const renderParticipants = () => {
    partListContainer.innerHTML = "";
    participantsArray.forEach((p, index) => {
      const div = document.createElement("div");
      div.className = "name-tag-item";
      div.textContent = p;

      // SUBSTITUÍDO: Confirmar remoção de participante com modal Quarky
      div.onclick = () => {
        const htmlContent = `
        <div style="text-align: center;">
            <p style="margin-bottom: 10px; opacity: 0.9;">Deseja remover da lista o nome:</p>
            <p style="margin-bottom: 25px; font-size: 1.4rem; font-weight: 900; color: #c1121f; text-transform: uppercase;">
              "${p}"
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="confirm-part-yes" class="confirm-btn confirm-btn-yes">Sim</button>
                <button id="confirm-part-no" class="confirm-btn confirm-btn-no">Não</button>
            </div>
        </div>`;

        triggerModal("Confirmação", htmlContent);

        document.getElementById("confirm-part-yes").onclick = () => {
          participantsArray.splice(index, 1);
          renderParticipants();
          closeModal();
        };
        document.getElementById("confirm-part-no").onclick = closeModal;
      };
      partListContainer.appendChild(div);
    });
  };

  window.startDrawAnimation = async () => {
    const totalParts = parseInt(partQtyInput.value) || 0;
    const totalTeams = parseInt(teamQtyInput.value) || 0;

    // Validações básicas (suas originais)
    if (totalTeams < 2 || isNaN(totalTeams))
      return triggerModal(
        "Atenção",
        "É necessário definir o limite correto de equipes!",
      );
    if (totalParts < 2 || isNaN(totalParts))
      return triggerModal(
        "Atenção",
        "É necessário definir o limite correto de participantes!",
      );
    if (participantsArray.length === 0)
      return triggerModal("Atenção", "A lista de participantes está vazia!");
    if (teamsData.length < totalTeams)
      return triggerModal(
        "Equipes Incompletas",
        `Adicione as ${totalTeams} equipes.`,
      );
    if (participantsArray.length < totalParts)
      return triggerModal(
        "Participantes Incompletos",
        `Faltam ${totalParts - participantsArray.length} nomes.`,
      );

    // ATIVA TRAVA: Bloqueia fechar o modal e o botão de sorteio
    isDrawing = true;
    drawTeamsBtn.disabled = true;
    if (closeModalBtn) closeModalBtn.style.opacity = "0.3"; // Visual de desativado

    let gridHTML = '<div class="results-grid">';
    teamsData.forEach((team, index) => {
      gridHTML += `
        <div class="team-column" id="modal-team-col-${index}" style="background-color: ${team.color};">
            <h3>${team.name}</h3>
            <div class="members-list" id="modal-list-${index}"></div>
        </div>`;
    });
    gridHTML += "</div>";

    triggerModal("Sorteando...", gridHTML);

    // LÓGICA DE SEPARAÇÃO DO ÚLTIMO NOME
    let namesToDraw = [...participantsArray].sort(() => Math.random() - 0.5);
    let lastName = null;

    // Se a divisão não for igualitária, removemos o último nome para mostrar depois
    if (namesToDraw.length % teamsData.length !== 0) {
      lastName = namesToDraw.pop();
    }

    let teamAssignmentCount = new Array(teamsData.length).fill(0);
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    // Função interna para processar a animação de cada nome
    const processName = async (name) => {
      const minCount = Math.min(...teamAssignmentCount);
      const possibleTeams = teamAssignmentCount
        .map((count, index) => ({ count, index }))
        .filter((t) => t.count === minCount);

      let teamIndex =
        possibleTeams[Math.floor(Math.random() * possibleTeams.length)].index;
      teamAssignmentCount[teamIndex]++;

      const highlight = document.createElement("div");
      highlight.className = "sorting-highlight-overlay";
      highlight.innerHTML = `<span style="color:#eb5e28; font-weight:bold;">SORTEANDO</span><h1>${name}</h1>`;
      document.body.appendChild(highlight);

      await delay(4000);
      highlight.remove();

      const targetList = document.getElementById(`modal-list-${teamIndex}`);
      const pDiv = document.createElement("div");
      pDiv.className = "participant-in-team winner-number-highlight";
      pDiv.textContent = name;

      const animClasses = ["anim-v1", "anim-v2", "anim-v3", "anim-v4"];
      pDiv.classList.add(
        animClasses[Math.floor(Math.random() * animClasses.length)],
      );

      targetList.appendChild(pDiv);
      await delay(800);
    };

    // Sorteia a lista principal
    for (let name of namesToDraw) {
      await processName(name);
    }

    // Se sobrou um nome, ele entra agora (o Grand Finale)
    if (lastName) {
      await processName(lastName);
    }

    // FINALIZAÇÃO: Libera os botões
    isDrawing = false;
    modalTitle.textContent = "Sorteio Concluído!";
    drawTeamsBtn.disabled = false;
    if (closeModalBtn) closeModalBtn.style.opacity = "1";
  };

  // Ativando o Botão do WhatsApp
  const btnWhatsapp = document.getElementById("btnWhatsapp");

  if (btnWhatsapp) {
    const mensagem = `Olá! 👋🏽\nVenho através do App *Quarky Sorteios* 🎲!`;
    const url = `https://wa.me/5547991719319?text=${encodeURIComponent(mensagem)}`;

    btnWhatsapp.onclick = (e) => {
      e.preventDefault(); // Evita comportamento padrão se for um link
      window.open(url, "_blank");
    };
  }
});
