function createNoteCard(note) {
  const article = document.createElement("article");
  article.className = "note-card";

  const title = document.createElement("h3");
  title.textContent = note.title;

  const meta = document.createElement("p");
  meta.className = "note-meta";
  meta.textContent = `Owner: ${note.ownerUsername} | ID: ${note.id} | Pinned: ${note.pinned}`;

  const body = document.createElement("div");
  body.className = "note-body";
  body.textContent = note.body;

  article.appendChild(title);
  article.appendChild(meta);
  article.appendChild(body);

  return article;
}

async function loadNotes(_ownerId, search) {
  const query = new URLSearchParams();

  if (search) {
    query.set("search", search);
  }

  const result = await api(`/api/notes?${query.toString()}`);
  const notesList = document.getElementById("notes-list");

  notesList.textContent = "";

  result.notes.forEach((note) => {
    notesList.appendChild(createNoteCard(note));
  });
}

(async function bootstrapNotes() {
  try {
    const user = await loadCurrentUser();

    if (!user) {
      document.getElementById("notes-list").textContent = "Please log in first.";
      return;
    }

    document.getElementById("notes-owner-id").value = user.id;
    document.getElementById("create-owner-id").value = user.id;
    await loadNotes(user.id, "");
  } catch (error) {
    document.getElementById("notes-list").textContent = error.message;
  }
})();

document.getElementById("search-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  await loadNotes(formData.get("ownerId"), formData.get("search"));
});

document.getElementById("create-note-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const payload = {
    title: formData.get("title"),
    body: formData.get("body"),
    pinned: formData.get("pinned") === "on"
  };

  await api("/api/notes", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  await loadNotes(null, "");
  event.currentTarget.reset();

  const user = await loadCurrentUser();
  if (user) {
    document.getElementById("notes-owner-id").value = user.id;
    document.getElementById("create-owner-id").value = user.id;
  }
});
