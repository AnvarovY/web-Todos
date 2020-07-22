let data = [];

function init() {
    fetch("/get-todos").then((res) => {
        res.json().then((cloud) => {
            data = cloud;
            render();
        });
    });

    let type;
    let search;

    for (const radio of document.querySelectorAll('.radioBut')) {
        radio.addEventListener('change', () => {
            type = radio.value;
            render(search, type);
        })
    }

    document.querySelector('.searchStr')
        .addEventListener('input', (e) => {
            if (e.target.value.length !== 0) {
                search = e.target.value;
                render(search, type);
            }
            else {
                search = '';
                render('', type);                
            }
    })

    document.querySelector('.strTodo')
        .addEventListener('keypress', (e) => {
            if (e.target.value.length !== 0 && e.key === 'Enter') {
                const newtodo = {"title" : e.target.value,"completed":false};
                data.push(newtodo);
                fetch("/add-todo", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json;charset=utf-8",
                    },
                    body: JSON.stringify(newtodo),
                });
                e.target.value = '';
                render(search, type);
            }
    })
    
    document.querySelector('.remove')
        .addEventListener('click', () => {
            let newData = data.filter(x => !x.completed);
            data = newData;
            render(search, type);
            fetch("/remove-completed", {
                method: "POST",
            });
    })

    document.querySelector('.check')
        .addEventListener('click', (e) => {
            const check = e.target.checked;
            fetch("/all-toggle", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({check}),
            });
            if (e.target.checked)  {
                data.forEach(item => {
                    item.completed = true;
                });
            }else {
                data.forEach(item => {
                    item.completed = false;
                });
            }
            render(search, type);
        })
}

function render(highlight, type) {
    function filtertodo(todo, index, type) {
        return (type === "all" || !type) || (type === "completed" && data[index].completed) || (type === "active" && !data[index].completed);
    }
    document.querySelector('.list').innerHTML = data
    .map(function(item, index) {
        let title = _.escape(item.title);
        let _highlight = _.escapeRegExp(highlight);
        let checked1 = item.completed ? 'checked' : '';
        let string = `<div class="todo"><div class="box1"><input class="checkbox" id="check${index}" type="checkbox" ${checked1} value="${index}"></div>
        <div class="box2"><label for="check${index}">
        ${(index + 1)} ${highlight ? title.replace(new RegExp(_highlight, 'gi'), (match) => `<span style="color: red;">${match}</span>`): title}</label></div>
        <div class="box3"><button class="removeBut" value="${index}">❌</button></div></div>`;
        if (highlight && title.toLowerCase().includes(highlight.toLowerCase())) {
            return string
        } else if (!highlight) { 
            return string;
        }
    })
    .filter((todo, index) => filtertodo(todo, index, type))
    .join('');

    const toggleTodo = document.querySelectorAll('.checkbox');

    for (let checkbutton of toggleTodo) {
        checkbutton.addEventListener('change', () => {
            const num =  parseInt(checkbutton.value, 10);
            fetch("/toggle-todo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({num}),
            });
            data[num].completed = !data[num].completed;
            render(highlight, type);
        });  
    }  

    const removeTodo = document.querySelectorAll('.removeBut');

    for (let removeBut of removeTodo) {
        removeBut.addEventListener('click', () => {
            const num = parseInt(removeBut.value, 10);
            fetch("/remove-todo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({num}),
            });
            data.splice(num, 1);
            render(highlight, type);
        });  
    }  

    let leftTodo = 0;
    for (let todo of data) {
        if (todo.completed) {
            ++leftTodo;
        }
    }
    document.querySelector('.left').innerHTML = ('<div class="left"><b> Дел осталось: ' + (data.length - leftTodo) + '</b></div>');

    document.querySelector('.remove').innerHTML =
        `<div><input class="remove" style="visibility: ${leftTodo === 0 ? 'hidden' : 'visible'}" type="button" value="Удалить завершенные"></div>`;

    document.querySelector('.check').checked = leftTodo === data.length;
}

init();