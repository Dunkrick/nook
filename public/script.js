const dreamInput = document.getElementById("dreamInput");
const saveBtn = document.getElementById("saveBtn");
const dreamList = document.getElementById("dreamList");
const message = document.getElementById("message");

async function saveDream() {
    const dreamText = dreamInput.value.trim();

    if (!dreamText) {
        message.innerText = "Dream cannot be empty";
        return;
    }

    const response = await fetch("/dreams", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            dream: dreamText,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        message.innerText = data.error;
        return;
    }

    message.innerText = `Dream saved: ${data.text}`;

    dreamInput.value = "";

    await loadDreams();
}

async function deleteDream(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this dream?"
    );

    if (!confirmed) {
        return;
    }

    const response = await fetch(`/dreams/${id}`, {
        method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
        message.innerText = data.error;
        return;
    }

    message.innerText = "Dream deleted successfully";

    await loadDreams();
}

async function loadDreams() {
    const response = await fetch("/dreams");

    if (!response.ok) {
        message.innerText = "Failed to load dreams";
        return;
    }

    const dreams = await response.json();

    dreamList.innerHTML = "";

    if (dreams.length === 0) {
        const li = document.createElement("li");
        li.innerText = "No dreams yet";
        dreamList.appendChild(li);
        return;
    }

    for (const dream of dreams) {
        const li = document.createElement("li");

        const dreamText = document.createElement("span");
        dreamText.innerText = dream.text;

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";

        deleteBtn.addEventListener("click", () => {
            deleteDream(dream.id);
        });

        li.appendChild(dreamText);
        li.appendChild(deleteBtn);

        dreamList.appendChild(li);
    }
}

saveBtn.addEventListener("click", saveDream);

loadDreams();