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
            if (e.target.checked)  {
                data.forEach(item => {
                    item.completed = true;
                });
                fetch("/all-todo-true", {
                    method: "POST",
                });
            }else {
                data.forEach(item => {
                    item.completed = false;
                });
                fetch("/all-todo-false", {
                    method: "POST",
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
        let checked1 = item.completed ? 'checked' : '';
        let string = `<div class="todo"><div class="box1"><input class="checkbox" id="check${index}" type="checkbox" ${checked1} value="${index}"></div><div class="box2"><label for="check${index}">${(index + 1)} ${item.title}</label></div><div class="box3"><button class="removeBut" value="${index}">❌</button></div></div>`;
        if (highlight && item.title.toLowerCase().includes(highlight.toLowerCase())) {
            return string.replace(new RegExp(highlight, 'gi'), (match) => `<span style="color: red;">${match}</span>`);
        } else if (!highlight) { 
            return string;
        }
    })
    .filter((todo, index) => filtertodo(todo, index, type))
    .join('');

    const toggleTodo = document.querySelectorAll('.checkbox');

    for (let i = 0; i < toggleTodo.length; ++i) {
        const checkbuton = toggleTodo[i];
        checkbuton.addEventListener('change', () => {
            const num =  parseInt(checkbuton.value, 10);
            fetch("/toggle-todo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({num}),
            });
            if (data[num].completed) {
                data[num].completed = false;
            }
            else {
                data[num].completed = true;
            }
            render(highlight, type);
        });  
    }  

    const removeTodo = document.querySelectorAll('.removeBut');

    for (let i = 0; i < removeTodo.length; ++i) {
        const removeBut = removeTodo[i];
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
    for (let i = 0; i < data.length; ++i) {
        if (data[i].completed) {
            ++leftTodo;
        }
    }
    document.querySelector('.left').innerHTML = ('<div class="left"><b> Дел осталось: ' + (data.length - leftTodo) + '</b></div>');

    document.querySelector('.remove').innerHTML = leftTodo === 0 ? ('<div><input class="remove" style="visibility: hidden" type="button" value="Удалить завершенные"></div>'):
    ('<div><input class="remove" style="visibility: visible" type="button" value="Удалить завершенные"></div>');

    if (leftTodo === data.length) {
        document.querySelector('.check').checked = true; 
    } else {
        document.querySelector('.check').checked = false; 
    }
}

init();