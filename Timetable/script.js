const svg = document.getElementById('timetable');
const activities = [];

function initializeTimetable() {
    // Draw the outer circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '50');
    circle.setAttribute('cy', '50');
    circle.setAttribute('r', '45');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#333');
    circle.setAttribute('stroke-width', '0.5');
    svg.appendChild(circle);

    // Add time markers and notches
    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * 360 - 90;
        const radians = angle * Math.PI / 180;
        const innerX = 50 + 45 * Math.cos(radians);
        const innerY = 50 + 45 * Math.sin(radians);
        const outerX = 50 + 47 * Math.cos(radians);
        const outerY = 50 + 47 * Math.sin(radians);
        const textX = 50 + 52 * Math.cos(radians);
        const textY = 50 + 52 * Math.sin(radians);

        // Draw notch
        const notch = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        notch.setAttribute('x1', innerX);
        notch.setAttribute('y1', innerY);
        notch.setAttribute('x2', outerX);
        notch.setAttribute('y2', outerY);
        notch.setAttribute('class', 'notch');
        svg.appendChild(notch);

        // Add time text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('class', 'time-marker');
        text.textContent = i === 0 ? '24' : i;
        svg.appendChild(text);
    }
}

function addActivity() {
    const activity = document.getElementById('activityInput').value;
    const startTime = parseInt(document.getElementById('startTimeInput').value);
    const endTime = parseInt(document.getElementById('endTimeInput').value);

    if (activity && !isNaN(startTime) && !isNaN(endTime)) {
        activities.push({ activity, startTime, endTime });
        updateTimetable();
    } else {
        alert('Please enter valid inputs');
    }
}

function updateTimetable() {
    // Clear existing activities
    const existingSlices = svg.querySelectorAll('.slice, .slice-text');
    existingSlices.forEach(slice => slice.remove());

    activities.forEach((item, index) => {
        const startAngle = (item.startTime / 24) * 360 - 90;
        let endAngle = (item.endTime / 24) * 360 - 90;
        
        // Adjust end angle if it wraps around midnight
        if (endAngle <= startAngle) {
            endAngle += 360;
        }

        createSlice(startAngle, endAngle, item.activity, index);
    });
}

function openUIMenu(event) {
    // Create a UI menu element
    console.log("clicked, opening UI..."); 

    const menu = document.createElement('div');
    menu.className = 'ui-menu';
    menu.style.position = 'absolute';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    menu.innerHTML = `
        <ul>
            <li>Option 1</li>
            <li>Option 2</li>
            <li>Option 3</li>
        </ul>
    `;
    /*
    // Add functionality to close the menu
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
    */

    // Append the menu to the body or the SVG container
    document.body.appendChild(menu);
}

function createSlice(startAngle, endAngle, activity, index) {
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    const startX = 50 + 45 * Math.cos(startAngle * Math.PI / 180);
    const startY = 50 + 45 * Math.sin(startAngle * Math.PI / 180);
    const endX = 50 + 45 * Math.cos(endAngle * Math.PI / 180);
    const endY = 50 + 45 * Math.sin(endAngle * Math.PI / 180);

    const slice = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    slice.setAttribute('d', `M 50 50 L ${startX} ${startY} A 45 45 0 ${largeArcFlag} 1 ${endX} ${endY} Z`);
    slice.setAttribute('class', 'slice');
    slice.setAttribute('style', 'fill: ' + getRandomColor());
    
    slice.addEventListener('click', function(event) {
        // Call a function to open the UI menu
        openUIMenu(event);
    });

    svg.appendChild(slice);

    // Calculate the middle angle for text positioning
    let middleAngle = (startAngle + endAngle) / 2;

    const textRadius = 25; // Adjust this value to move text closer to or further from the center

    const textX = 50 + textRadius * Math.cos(middleAngle * Math.PI / 180);
    const textY = 50 + textRadius * Math.sin(middleAngle * Math.PI / 180);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', textX);
    text.setAttribute('y', textY);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('class', 'slice-text');
    text.textContent = activity;
    svg.appendChild(text);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Initialize the timetable when the page loads
initializeTimetable();