const dragArea = document.querySelector(".content__square_drag-area");
const dropAreas = document.querySelectorAll(".content__drop-area");

// координаты элемента (нужно для реализации скролла)
const elementPosition = {
    x: 0,
    y: 0,
};

// функция получения рандомного HEX-цвета
const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// создадим квадрат с рандомным цветом
const createSquare = () => {
    const square = document.createElement("div");
    square.classList.add("content__square");
    square.style.position = "absolute";
    square.style.animation = "none";
    square.style.backgroundColor = getRandomColor();
    return square;
};

// хелпер для задания корректных координат при клике на элемент (чтобы новый квадрат создался ровно на том же месте где и drag область)
const moveElement = (elem, x, y) => {
    elem.style.left = `${x}px`;
    elem.style.top = `${y}px`;
};

dragArea.addEventListener("pointerdown", (e) => {
    const square = createSquare();
    document.body.appendChild(square);

    const { top, left } = dragArea.getBoundingClientRect(); // получим координаты drag области, что видит клиент

    // определим смещение по оси Х и Y в зависимости от того - где произошёл клик
    const shiftX = e.clientX - left;
    const shiftY = e.clientY - top;

    moveElement(square, e.pageX - shiftX, e.pageY - shiftY);

    // колбэк для перемещения курсором/пальцем/стилусом
    const pointerMove = (e) => {
        // ищем подходящее поле для вставки
        const dropArea = document
            .elementsFromPoint(e.clientX, e.clientY)
            .find((node) => node.classList.contains("content__drop-area"));

        // наведём фокус, если попали на одно из полей
        dropAreas.forEach((area) => {
            if (dropArea === area)
                area.classList.add("content__drop-area_focus");
            else area.classList.remove("content__drop-area_focus");
        });

        // сместим элемент по координатам указателя
        elementPosition.x = e.clientX - shiftX;
        elementPosition.y = e.clientY - shiftY;
        moveElement(
            square,
            elementPosition.x + scrollX,
            elementPosition.y + scrollY
        );

        // автоскролл если потянутый элемент внизу экрана и ещё есть место куда пролистывать
        if (
            e.clientY >= window.innerHeight - 10 &&
            e.pageY < document.body.offsetHeight - 10
        ) {
            window.scrollBy({
                top: 100,
                behavior: "smooth",
            });
        }

        // а это если элемент вверху
        if (e.clientY <= 10 && e.clientY !== e.pageY) {
            window.scrollBy({
                top: -100,
                behavior: "smooth",
            });
        }
    };

    // колбэк для отпускания элементов и удаления обработчиков
    const pointerUp = (e) => {
        // удаляем обработчики, чтобы не висели в браузере
        document.removeEventListener("pointermove", pointerMove);
        document.removeEventListener("pointerup", pointerUp);
        document.removeEventListener("scroll", scrolling);

        // уберём фокус с поля
        dropAreas.forEach((area) =>
            area.classList.remove("content__drop-area_focus")
        );

        // чекаем действительно ли мы над нужной областью
        const dropArea = document
            .elementsFromPoint(e.clientX, e.clientY)
            .find((node) => node.classList.contains("content__drop-area"));

        // если нет - то удалим созданный квадрат
        if (!dropArea) {
            document.body.removeChild(square);
            return;
        }

        square.style.cursor = "default";

        // иначе добавим его в нашу область
        dropArea.appendChild(square);
        if (dropArea.classList.contains("content__drop-area_flex"))
            square.style.position = "static";
        if (dropArea.classList.contains("content__drop-area_owerflow"))
            moveElement(
                square,
                e.pageX - shiftX - dropArea.offsetLeft,
                e.pageY - shiftY - dropArea.offsetTop
            );
    };

    const scrolling = () => {
        moveElement(
            square,
            elementPosition.x + scrollX,
            elementPosition.y + scrollY
        );
    };

    // повесим обработчики на движение и отпускание
    document.addEventListener("pointermove", pointerMove);
    document.addEventListener("pointerup", pointerUp);
    document.addEventListener("scroll", scrolling);
});
