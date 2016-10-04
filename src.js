$(function() {
	let $calendar = $('#calendar');
	let events;
	let curr = new Date;
	let first = curr.getDate() - curr.getDay();
	let last = first + 6;
	let firstDayOfWeek = new Date(curr.setDate(first));
	let lastDayOfWeek = new Date(curr.setDate(last));
	firstDayOfWeek.setHours(0, 0, 0, 0);
	lastDayOfWeek.setHours(23, 59, 59, 999);

	displayHeadings();
	generateCalendarMarkup();

	$.getJSON('data.json').done(displayEvents);

	function displayHeadings() {
		let locale = "en-us";
		let longMonth = lastDayOfWeek.getMonth() === firstDayOfWeek.getMonth() ? undefined : 'long';
    	let weekBegins = firstDayOfWeek.toLocaleString(locale, { month: 'long', day: 'numeric' });
    	let weekEnds = lastDayOfWeek.toLocaleString(locale, { month: longMonth, day: 'numeric' });
		$('#header').text(`${weekBegins} – ${weekEnds}`);
	}

	function generateCalendarMarkup() {
		for (let i = 0; i < 48; i++) {
			let fullHour = i % 2 === 0;
			let label = '' + Math.floor(i/2) + ':' + (fullHour ? '00' : '30');
			let $row = $('<tr>').attr('data-time', label);
			let $cell = $('<td>').addClass('time-cell');
			if (fullHour) {
				$cell.text(label);
				$row.addClass('full');
			} else {
				$row.addClass('half');
			}
			$row.append($cell);
			for (let j = 0; j < 7; j++) {
				$cell = $('<td>').attr('data-day', j).addClass((new Date).getDay() === j ? 'current' : '');
				$row.append($cell);
			}
			$calendar.append($row);
		} 	
	}

	function displayEvents(json) {
		events = json;

		for (let event of events) {
			displaySingleEvent(event);
		}
	}

	function displaySingleEvent(event) {
		const emsPerHour = 3;
		let start = new Date(event.startDate);
		let end = new Date(event.endDate);
		let length = end - start;
		let day = start.getDay();
		let displayTime = start.getHours() + ':' + (start.getMinutes() < 30 ? '00' : '30');
		let $event = $('<div>').addClass('event').text(event.name);
		$event.css ('height', `${emsPerHour * length/1000/60/60}em`);

		if (start >= firstDayOfWeek && end <= lastDayOfWeek) {
			let $slot = $calendar.find(`[data-time="${displayTime}"] [data-day="${day}"]`);
			if (!$slot.is(':empty')) {
				$slot.find('.event').addClass('overlap');
				$event.addClass('overlap');
			}
			$slot.append($event);

		}

		if (start.getDate() !== end.getDate()) {
			let midnight = new Date(1900+end.getYear(), end.getMonth(), end.getDate());
			midnight.setHours(0, 0, 0, 0);

			let nextDayEvent = {
				name:  event.name,
				startDate: midnight,
				endDate: event.endDate
			};
			displaySingleEvent(nextDayEvent);
		}
	}
});
