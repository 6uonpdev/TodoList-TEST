let currentUser = "user";
let tasks = JSON.parse(localStorage.getItem("tasks") || "{}");

// ==============================================================
// THÊM CÔNG VIỆC MỚI
// =============================================================
document.getElementById("add-btn").onclick = () => {
    let title = document.getElementById("task-input").value.trim();
    let deadline = document.getElementById("deadline-input").value;

    if (!title) return alert("Vui lòng nhập công việc");
    if (!tasks[currentUser]) tasks[currentUser] = [];
    tasks[currentUser].push({
        id: Date.now(),
        title,
        deadline,
        completed: false
    });

    document.getElementById("task-input").value = "";
    document.getElementById("deadline-input").value = "";
    save();
    render();
};

// ============================================================
// XOÁ CÔNG VIỆC
// ============================================================
function del(id) {
    tasks[currentUser] = tasks[currentUser].filter(x => x.id !== id);
    save();
    render();
}

function toggle(id) {
    let t = tasks[currentUser].find(x => x.id === id);
    t.completed = !t.completed;
    save();
    render();
}

/* ============================================================
   FILTER EVENT LISTENERS
============================================================ */
document.getElementById("filter").addEventListener("change", render);
document.getElementById("filter-date").addEventListener("change", render);

/* ============================================================
   ĐỊNH DẠNG THỜI GIAN
============================================================ */
function formatDeadline(deadline) {
    if (!deadline) return "Không có";
    const parts = deadline.split("T");
    const date = parts[0]; 
    const time = parts[1];
    const [hours, minutes] = time.split(":");
    let hour12 = parseInt(hours);
    const ampm = hour12 >= 12 ? "PM" : "AM";
    if (hour12 > 12) {
        hour12 -= 12;
    } else if (hour12 === 0) {
        hour12 = 12;
    }
    
    const formattedTime = `${String(hour12).padStart(2, "0")}:${minutes} ${ampm}`;
    return `${date} ${formattedTime}`;
}

// ============================================================
// LƯU TRỮ & HIỂN THỊ
// ============================================================
function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function render() {
    let list = tasks[currentUser];
    let filterVal = document.getElementById("filter").value;
    let filterDateVal = document.getElementById("filter-date").value;
    let html = "";
    list
        .filter(t => {
            if (filterVal === "completed") return t.completed;
            if (filterVal === "pending") return !t.completed;
            return true;
        })
        .filter(t => {
            if (!filterDateVal) return true;
            return t.deadline && t.deadline.startsWith(filterDateVal);
        })
        .forEach(t => {
            html += `
            <div class="task-card">
                <div class="task-left">
                    <input type="checkbox" ${t.completed ? "checked" : ""}
                        onclick="toggle(${t.id})" />
                    <div>
                        <div class="${t.completed ? "completed" : ""}">
                            ${t.title}
                        </div>
                        <small><i class="fa-solid fa-hourglass-half"></i> ${formatDeadline(t.deadline)}</small>
                    </div>
                </div>

                <div class="icons">
                    <i class="fa-solid fa-pen-to-square" id="edit-icon-btn" onclick="editTask(${t.id})"></i>
                    <i class="fa-solid fa-trash-can" id="delete-icon-btn" onclick="del(${t.id})"></i>
                </div>
            </div>
            `;
        });

    document.getElementById("task-list").innerHTML = html;
}