const addTaskBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const closeModalBtn = document.querySelector('.close');
const saveTaskBtn = document.getElementById('save-task-btn');
const taskStartTimeInput = document.getElementById('task-start-time');
const taskEndTimeInput = document.getElementById('task-end-time');
const taskDescInput = document.getElementById('task-desc');
const scheduleList = document.getElementById('schedule-list');

const prevDayBtn = document.getElementById('prev-day-btn');
const nextDayBtn = document.getElementById('next-day-btn');
const currentDateDisplay = document.getElementById('current-date');

const showSummaryBtn = document.getElementById('show-summary-btn');
const summaryModal = document.getElementById('summary-modal');
const closeSummaryBtn = document.querySelector('.close-summary');
const summaryList = document.getElementById('summary-list');

let currentDate = new Date();
const scheduleData = {};

addTaskBtn.addEventListener('click', () => {
    taskModal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
    taskModal.style.display = 'none';
});

saveTaskBtn.addEventListener('click', () => {
    const startTime = taskStartTimeInput.value;
    const endTime = taskEndTimeInput.value;
    const description = taskDescInput.value;
    if (startTime && endTime && description) {
        addTaskToSchedule(startTime, endTime, description, currentDate);
        taskModal.style.display = 'none';
    } else {
        alert('Please enter a start time, end time, and description for the task.');
    }
});

function addTaskToSchedule(startTime, endTime, description, date) {
    const dateString = date.toDateString();
    if (!scheduleData[dateString]) {
        scheduleData[dateString] = [];
    }

    const task = {
        startTime,
        endTime,
        description,
        completed: false,
        timeTracked: { minutes: 0, seconds: 0 },
    };

    scheduleData[dateString].push(task);

    // 시작 시간 순으로 정렬
    scheduleData[dateString].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
    });

    renderSchedule();
}

function renderSchedule() {
    const dateString = currentDate.toDateString();
    scheduleList.innerHTML = '';

    if (scheduleData[dateString]) {
        scheduleData[dateString].forEach((task, index) => {
            const listItem = document.createElement('li');
            
            const taskInfo = document.createElement('div');
            taskInfo.innerHTML = `<strong>${task.description}</strong> (${task.startTime} - ${task.endTime})`;

            if (task.completed) {
                listItem.classList.add('completed');
            }

            const controls = document.createElement('div');
            controls.classList.add('schedule-item-controls');

            const stopwatch = document.createElement('span');
            stopwatch.classList.add('stopwatch');
            updateStopwatchDisplay(task.timeTracked, stopwatch);

            let stopwatchInterval = null;

            const startBtn = document.createElement('button');
            startBtn.textContent = 'Start';
            startBtn.addEventListener('click', () => {
                if (!stopwatchInterval) {
                    stopwatchInterval = setInterval(() => {
                        task.timeTracked.seconds++;
                        if (task.timeTracked.seconds === 60) {
                            task.timeTracked.seconds = 0;
                            task.timeTracked.minutes++;
                        }
                        updateStopwatchDisplay(task.timeTracked, stopwatch);
                    }, 1000);
                }
            });

            const stopBtn = document.createElement('button');
            stopBtn.textContent = 'Stop';
            stopBtn.addEventListener('click', () => {
                clearInterval(stopwatchInterval);
                stopwatchInterval = null;
            });

            const completeBtn = document.createElement('button');
            completeBtn.textContent = 'Complete';
            completeBtn.classList.add('complete');

            completeBtn.addEventListener('click', () => {
                task.completed = true;
                listItem.classList.add('completed');
            });

            const postponeBtn = document.createElement('button');
            postponeBtn.textContent = 'Postpone to Tomorrow';
            postponeBtn.classList.add('postpone');

            postponeBtn.addEventListener('click', () => {
                postponeTaskToTomorrow(index);
            });

            const controlRow = document.createElement('div');
            controlRow.classList.add('controls-row');
            controlRow.appendChild(startBtn);
            controlRow.appendChild(stopBtn);

            const controlColumn = document.createElement('div');
            controlColumn.classList.add('controls-column');
            controlColumn.appendChild(completeBtn);
            controlColumn.appendChild(postponeBtn);

            controls.appendChild(stopwatch);
            controls.appendChild(controlRow);
            controls.appendChild(controlColumn);

            listItem.appendChild(taskInfo);
            listItem.appendChild(controls);
            scheduleList.appendChild(listItem);
        });
    }
}

function updateStopwatchDisplay(timeTracked, displayElement) {
    displayElement.textContent = `${String(timeTracked.minutes).padStart(2, '0')}:${String(timeTracked.seconds).padStart(2, '0')}`;
}

function postponeTaskToTomorrow(taskIndex) {
    const todayString = currentDate.toDateString();
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toDateString();

    if (!scheduleData[tomorrowString]) {
        scheduleData[tomorrowString] = [];
    }

    const task = scheduleData[todayString][taskIndex];
    scheduleData[tomorrowString].push(task);
    scheduleData[todayString].splice(taskIndex, 1);

    renderSchedule();
}

function updateDateDisplay() {
    currentDateDisplay.textContent = currentDate.toDateString();
}

prevDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    renderSchedule();
});

nextDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    renderSchedule();
});

showSummaryBtn.addEventListener('click', () => {
    displaySummary();
    summaryModal.style.display = 'flex';
});

closeSummaryBtn.addEventListener('click', () => {
    summaryModal.style.display = 'none';
});

function displaySummary() {
    const todayString = currentDate.toDateString();
    summaryList.innerHTML = '';

    let totalMinutes = 0;
    let totalSeconds = 0;

    if (scheduleData[todayString]) {
        scheduleData[todayString].forEach(task => {
            const taskMinutes = task.timeTracked.minutes;
            const taskSeconds = task.timeTracked.seconds;

            totalMinutes += taskMinutes;
            totalSeconds += taskSeconds;

            // 초 단위가 60초 이상이면 분으로 변환
            if (totalSeconds >= 60) {
                totalMinutes += Math.floor(totalSeconds / 60);
                totalSeconds = totalSeconds % 60;
            }

            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${task.description}</strong> - Time Tracked: ${String(taskMinutes).padStart(2, '0')}:${String(taskSeconds).padStart(2, '0')}`;
            summaryList.appendChild(listItem);
        });

        // 총 시간을 표시
        const totalTimeItem = document.createElement('li');
        totalTimeItem.innerHTML = `<strong>Total Time Tracked:</strong> ${String(totalMinutes).padStart(2, '0')}:${String(totalSeconds).padStart(2, '0')}`;
        summaryList.appendChild(totalTimeItem);
    } else {
        const listItem = document.createElement('li');
        listItem.innerHTML = "No tasks for today.";
        summaryList.appendChild(listItem);
    }
}

updateDateDisplay();
renderSchedule();