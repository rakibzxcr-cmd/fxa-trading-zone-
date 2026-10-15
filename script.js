const launcher = document.getElementById("supportLauncher");
const panel = document.getElementById("supportPanel");
const closeBtn = document.getElementById("supportClose");
const messages = document.getElementById("supportMessages");
const form = document.getElementById("supportForm");
const input = document.getElementById("supportInput");

const answers = {
  telegram: "Our Telegram Channel:\nhttps://t.me/rakibfxatrading",
  bot: "Official Bot:\nhttps://t.me/FXATradingZoneBot",
  exness: "Exness Account:\nhttps://one.exnessonelink.com/a/929pyfpnpw",
  quotex: "Quotex Account:\nhttps://broker-qx.pro/sign-up/?lid=2343151",
  binance: "Binance Account:\nhttps://www.binance.com/referral/mystery-box/referral-dhamaka-2026/claim?ref=GRO_100017456_S2J55",
  admin: "Admin Support:\nhttps://t.me/sumaiyasimux",
  facebook: "Facebook Page:\nhttps://www.facebook.com/share/19RpWwwZS1/",
  risk: "Trading involves risk. You can lose money. This website is for education, not financial advice or guaranteed profit.",
  help: "I can help with Telegram, Official Bot, account links, Facebook or Admin Support. Type the name you need."
};

function toggleSupport(open) {
  panel.classList.toggle("open", open);
  panel.setAttribute("aria-hidden", String(!open));
}

launcher.addEventListener("click", () => {
  toggleSupport(!panel.classList.contains("open"));
});

closeBtn.addEventListener("click", () => toggleSupport(false));

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "message " + (type === "user" ? "user-message" : "bot-message");
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function getAnswer(text) {
  const q = text.toLowerCase();
  if (q.includes("telegram") || q.includes("channel")) return answers.telegram;
  if (q.includes("bot")) return answers.bot;
  if (q.includes("exness")) return answers.exness;
  if (q.includes("quotex")) return answers.quotex;
  if (q.includes("binance")) return answers.binance;
  if (q.includes("facebook")) return answers.facebook;
  if (q.includes("admin") || q.includes("support")) return answers.admin;
  if (q.includes("risk") || q.includes("profit") || q.includes("ঝুঁকি")) return answers.risk;
  return answers.help;
}

form.addEventListener("submit", function(event) {
  event.preventDefault();
  const question = input.value.trim();
  if (!question) return;
  addMessage(question, "user");
  input.value = "";
  setTimeout(() => addMessage(getAnswer(question), "bot"), 200);
});

document.querySelectorAll("[data-question]").forEach(button => {
  button.addEventListener("click", () => {
    const question = button.dataset.question;
    addMessage(question, "user");
    addMessage(getAnswer(question), "bot");
  });
});

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
