let data = [];

function init() {
    fetch("/get-todos").then((res) => {
        res.json().then((cloud) => {
            data = cloud;
            render();
        });
    });

    for (const radio of document.querySelectorAll('.radioBut')) {
        radio.addEventListener('change', () => {
            type = radio.value;
            render();
        })
    }

    document.querySelector('.searchStr')
        .addEventListener('input', (e) => {
            if (e.target.value.length !== 0) {
                render();
            }
            else {
                e.target.value = '';
                render();                
            }
    })

    document.querySelector('.strTodo')
        .addEventListener('keypress', (e) => {
            if (e.target.value.length !== 0 && e.key === 'Enter') {
                const newtodo = {"title" : e.target.value,"completed":false};
                data.listTodos.push(newtodo);
                fetch("/add-todo", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json;charset=utf-8",
                    },
                    body: JSON.stringify(newtodo),
                });
                e.target.value = '';
                render();
            }
    })
    
    document.querySelector('.remove')
        .addEventListener('click', () => {
            let newData = data.listTodos.filter(x => !x.completed);
            data.listTodos = newData;
            render();
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
                data.listTodos.forEach(item => {
                    item.completed = true;
                });
            }else {
                data.listTodos.forEach(item => {
                    item.completed = false;
                });
            }
            render();
        })
}

function render() {
    const highlight = document.querySelector('.searchStr').value;
    const type = document.querySelector('.radioBut:checked').value;

    function filtertodo(todo) {
        if (todo.title.toLowerCase().includes(highlight.toLowerCase()) || !highlight) {
            return (type === "all" || !type) || (type === "completed" && todo.completed) || (type === "active" && !todo.completed);
        }
    }

    document.querySelector('.list').innerHTML = data.listTodos
    .map((item, index) => ({
        todo: item,
        index: index,
    }))
    .filter((item) => filtertodo(item.todo))
    .map(function(item) {
        const title = _.escape(item.todo.title);
        const _highlight = _.escapeRegExp(highlight);
        const checked1 = item.todo.completed ? 'checked' : '';
        const string = `<div class="todo"><div class="box1"><input class="checkbox" id="check${item.index}" type="checkbox" ${checked1} value="${item.index}"></div>
        <div class="box2"><label for="check${item.index}">
        ${(item.index + 1)} ${highlight ? title.replace(new RegExp(_highlight, 'gi'), (match) => `<span style="color: red;">${match}</span>`): title}</label></div>
        <div class="box3"><button class="removeBut" value="${item.index}">❌</button></div></div>`;
        return string;
    })
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
            data.listTodos[num].completed = !data.listTodos[num].completed;
            render();
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
            data.listTodos.splice(num, 1);
            render();
        });  
    }  

    let leftTodo = data.listTodos.filter(x => x.completed).length;
    document.querySelector('.left').innerHTML = ('<div class="left"><b> Дел осталось: ' + (data.listTodos.length - leftTodo) + '</b></div>');

    document.querySelector('.remove').innerHTML =
        `<div><input class="remove" style="visibility: ${leftTodo === 0 ? 'hidden' : 'visible'}" type="button" value="Удалить завершенные"></div>`;

    document.querySelector('.check').checked = leftTodo === data.listTodos.length;
}

init();