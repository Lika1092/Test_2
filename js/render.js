let currentQuestionIndex = 0
let score = 0
let questions = []
let answered = {}

function showQuestion(index) {
	currentQuestionIndex = index
	const root = document.getElementById('questions')
	root.innerHTML = ''
	const q = questions[index]

	const div = document.createElement('div')
	div.className = 'question active'
	div.id = q.id

	div.innerHTML = `<h3>${q.question}</h3>`

	// Подсказка
	if (q.hint) {
		div.innerHTML += `<button class="hint-btn" onclick="toggleHint('${q.id}')">?</button>
                      <div class="hint-text" id="hint-${q.id}">${q.hint}</div>`
	}

	if (q.type === 'text') {
		div.innerHTML += `
    <input id="input-${q.id}" placeholder="Введите ответ" class="text-input">
    <button class="check-btn" onclick="checkText('${q.id}', '${q.answer}')">Проверить</button>
  `
	}


	if (q.type === 'radio') {
		q.options.forEach((opt, i) => {
			div.innerHTML += `<label class="option"><input type="radio" name="${q.id}" value="${i+1}"> ${opt}</label>`
		})
		div.innerHTML += `<button class="check-btn" onclick='checkRadio("${q.id}", ${q.correct[0]})'>Проверить</button>`
	}

	if (q.type === 'checkbox') {
		q.options.forEach((opt, i) => {
			div.innerHTML += `<label class="option"><input type="checkbox" value="${i+1}"> ${opt}</label>`
		})
		div.innerHTML += `<button class="check-btn" onclick='checkCheckbox("${
			q.id
		}", ${JSON.stringify(q.correct)})'>Проверить</button>`
	}
	

	if (q.type === 'match') {
	

		// очищаем и нормализуем options
		const cleanOptions = q.options.map(o => o.trim()).filter(o => o !== '')

		// делим на буквы и цифры
		const leftItems = cleanOptions.filter(o => /^[А-ЯA-Z]/.test(o))
		const rightItems = cleanOptions.filter(o => /^[0-9]/.test(o))

		// контейнер списков
		const listContainer = document.createElement('div')
		listContainer.style.display = 'flex'
		listContainer.style.justifyContent = 'space-between'
		listContainer.style.gap = '20px'
		listContainer.style.marginBottom = '15px'

		const left = document.createElement('div')
		const right = document.createElement('div')

		leftItems.forEach(item => {
			const letter = item[0]
			const text = item.slice(1).trim()
			const p = document.createElement('p')
			p.textContent = `${letter} ${text}`
			left.appendChild(p)
		})

		rightItems.forEach(item => {
			const number = item[0]
			const text = item.slice(1).trim()
			const p = document.createElement('p')
			p.textContent = `${number} ${text}`
			right.appendChild(p)
		})

		listContainer.appendChild(left)
		listContainer.appendChild(right)
		div.appendChild(listContainer)

		// таблица ввода ответа
		const table = document.createElement('table')
		table.className = 'match-table'

		leftItems.forEach((item, i) => {
			const letter = item[0]
			const row = document.createElement('tr')
			row.innerHTML = `
			<td style="padding-right:10px">${letter}</td>
			<td>
				<input 
					type="text" 
					id="input-${q.id}-${i}" 
					maxlength="1" 
					placeholder="№">
			</td>
		`
			table.appendChild(row)
		})

		div.appendChild(table)

		div.innerHTML += `
		<button class="check-btn" onclick="checkMatch('${q.id}')">
			Проверить
		</button>
	`
	}

	root.appendChild(div)
	highlightNavButton(index)
}



// Подсказка
function toggleHint(id) {
	const h = document.getElementById('hint-' + id)
	h.style.display = h.style.display === 'block' ? 'none' : 'block'
}

// Верхнее меню
function renderNav() {
	const nav = document.getElementById('question-nav')
	nav.innerHTML = ''
	questions.forEach((q, i) => {
		const btn = document.createElement('button')
		btn.textContent = i + 1
		btn.className = 'nav-btn'
		btn.onclick = () => showQuestion(i)
		btn.id = 'btn-' + q.id
		nav.appendChild(btn)
	})
}

function highlightNavButton(index) {
	questions.forEach((q, i) => {
		const btn = document.getElementById('btn-' + q.id)
		btn.classList.remove('active')
		if (i === index) btn.classList.add('active')
	})
}

// Проверка text
function checkText(qid, correct) {
	const input = document.getElementById('input-' + qid)
	const val = input.value.trim().toLowerCase()
	if (val === correct.toLowerCase()) {
		input.style.backgroundColor = '#2ecc71'
		score++
		markAnswered(qid)
	} else input.style.backgroundColor = '#e74c3c'
	updateResult()
	setTimeout(nextQuestion, 800)
}

// Проверка radio
function checkRadio(qid, correct) {
	if (answered[qid]) return
	answered[qid] = true

	const radios = document.querySelectorAll(`input[name="${qid}"]`)

	radios.forEach(r => {
		r.disabled = true
		const value = Number(r.value)

		if (value === correct) {
			r.parentElement.style.backgroundColor = '#2ecc71'
		} else if (r.checked) {
			r.parentElement.style.backgroundColor = '#e74c3c'
		}
	})

	const selected = document.querySelector(`input[name="${qid}"]:checked`)
	if (selected && Number(selected.value) === correct) {
		score++
	}

	markAnswered(qid)
	updateResult()
	setTimeout(nextQuestion, 800)
}



// Проверка checkbox
function checkCheckbox(qid, correct) {
	if (answered[qid]) return
	answered[qid] = true

	const container = document.getElementById(qid)
	const checks = container.querySelectorAll('input[type="checkbox"]')

	let user = []

	checks.forEach(c => {
		c.disabled = true

		const value = Number(c.value) // ← 1,2,3,4
		const isChecked = c.checked
		const isCorrect = correct.includes(value)

		if (isChecked && isCorrect) {
			c.parentElement.style.backgroundColor = '#2ecc71'
			user.push(value)
		} else if (isChecked && !isCorrect) {
			c.parentElement.style.backgroundColor = '#e74c3c'
			user.push(value)
		} else if (!isChecked && isCorrect) {
			c.parentElement.style.backgroundColor = '#2ecc71'
			c.parentElement.style.opacity = '0.6'
		}
	})

	const isCorrectAnswer =
		user.length === correct.length && user.every(v => correct.includes(v))

	if (isCorrectAnswer) score++

	markAnswered(qid)
	updateResult()
	setTimeout(nextQuestion, 800)
}

function checkMatch(qid) {
	if (answered[qid]) return
	answered[qid] = true

	const q = questions.find(x => x.id === qid)
	const correct = q.answer.split('') // "1342" → ["1","3","4","2"]

	let allCorrect = true

	correct.forEach((val, i) => {
		const input = document.getElementById(`input-${qid}-${i}`)
		input.disabled = true

		if (input.value.trim() === val) {
			input.style.backgroundColor = '#2ecc71'
		} else {
			input.style.backgroundColor = '#e74c3c'
			allCorrect = false
		}
	})

	if (allCorrect) score++

	markAnswered(qid)
	updateResult()
	setTimeout(nextQuestion, 800)
}


function markAnswered(qid) {
	const btn = document.getElementById('btn-' + qid)
	btn.classList.add('answered')
}

function nextQuestion() {
	if (currentQuestionIndex < questions.length - 1)
		showQuestion(currentQuestionIndex + 1)
}

// Результат
function updateResult() {
	document.getElementById(
		'result'
	).textContent = `Правильных: ${score} из ${questions.length}`
}

// Загрузка JSON
fetch('data/questions.json')
	.then(res => res.json())
	.then(data => {
		questions = data
		renderNav()
		showQuestion(0)
	})
