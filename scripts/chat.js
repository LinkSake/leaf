import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7mVpfqZuL6Gmcowj66fqTA3PI_9RSzYU",
  authDomain: "leaf-film-app.firebaseapp.com",
  databaseURL: "https://leaf-film-app-default-rtdb.firebaseio.com",
  projectId: "leaf-film-app",
  storageBucket: "leaf-film-app.firebasestorage.app",
  messagingSenderId: "595833458031",
  appId: "1:595833458031:web:122dffe32d7aa02c372c9a",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const urlParams = new URLSearchParams(window.location.search);
const user = urlParams.get("user") || "a";
const otherUser = user === "a" ? "b" : "a";

document.getElementById("you").textContent = user;

const chatRef = ref(db, "chat/messages");
const typingRef = ref(db, `chat/typing/${otherUser}`);
const myTypingRef = ref(db, `chat/typing/${user}`);
const readRef = ref(db, "chat/readReceipts");

const chatBox = document.getElementById("chat");
const input = document.getElementById("input");
const typingIndicator = document.getElementById("typingIndicator");

const appendMessage = (msg, isOwn = false) => {
  const div = document.createElement("div");
  div.className = "message";
  div.textContent =
    (isOwn ? "You: " : `${msg.from}: `) + msg.text + (msg.read ? " ✓" : "");
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
};

// Listen for new messages
onChildAdded(chatRef, (snapshot) => {
  const msg = snapshot.val();
  if (msg.to === user) {
    appendMessage(msg);
    set(ref(db, `chat/readReceipts/${snapshot.key}`), true);
  } else if (msg.from === user) {
    appendMessage(msg, true);
  }
});

// Typing indicator
onValue(typingRef, (snap) => {
  typingIndicator.textContent = snap.val() ? `${otherUser} is typing...` : "";
});

// Read receipts
onValue(readRef, (snap) => {
  const all = snap.val() || {};
  const nodes = document.querySelectorAll(".message");
  nodes.forEach((node) => {
    if (node.textContent.includes("You:") && !node.textContent.includes("✓")) {
      node.textContent += " ✓";
    }
  });
});

// Send messages
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && input.value.trim()) {
    push(chatRef, {
      from: user,
      to: otherUser,
      text: input.value,
      timestamp: Date.now(),
    });
    input.value = "";
    set(myTypingRef, false);
  } else {
    set(myTypingRef, true);
    clearTimeout(input._typingTimeout);
    input._typingTimeout = setTimeout(() => {
      set(myTypingRef, false);
    }, 1000);
  }
});
