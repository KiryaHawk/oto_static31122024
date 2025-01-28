ymaps.ready(function () {
    // Создаем карту
    const myMap = new ymaps.Map('map', {
        center: [55.751574, 37.573856], // Центр карты (Москва)
        zoom: 9, // Уровень масштаба
        controls: ['zoomControl', 'geolocationControl'], // Элементы управления
        behaviors: ['default', 'multiTouch'] // Включаем мультитач-жесты
    });

    // Создаем кластеризатор с макетом диаграмм
    const clusterer = new ymaps.Clusterer({
        clusterIconLayout: 'default#pieChart', // Макет диаграммы
        clusterIconPieChartRadius: 28, // Радиус диаграммы
        clusterIconPieChartCoreRadius: 13, // Радиус центральной части диаграммы
        clusterIconPieChartStrokeWidth: 3, // Ширина линий в диаграмме
        hasBalloon: false, // Отключаем балуны для кластеров
        interactivityModel: 'default#geoObject' // Прокидываем мультитач события на карту
    });

    // Добавляем поиск по карте
    const searchControl = new ymaps.control.SearchControl({
        options: {
            float: 'right', // Расположение поиска
            size: 'large', // Размер строки поиска
            noPlacemark: true, // Отключаем добавление меток поиска
            provider: 'yandex#map', // Используем провайдера Яндекса
            placeholderContent: 'Введите адрес или название места' // Текст-заглушка в строке поиска
        }
    });
    myMap.controls.add(searchControl); // Добавляем новый контрол на карту

    // Загружаем GeoJSON и добавляем объекты на карту
    fetch('open.geojson') // Указываем путь к GeoJSON файлу
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(geojsonData => {
            console.log("GeoJSON данные:", geojsonData); // Для проверки данных

            const geoObjects = geojsonData.features
                .filter(feature => feature.geometry.type === "Point") // Оставляем только точки
                .map(feature => {
                    const coordinates = feature.geometry.coordinates;
                    return new ymaps.Placemark(
                        [coordinates[1], coordinates[0]], // Меняем местами долготу и широту
                        {
                            hintContent: feature.properties.description,
                            balloonContent: feature.properties.description,
                            markerColor: feature.properties["marker-color"] || "#1E90FF" // Цвет метки из GeoJSON
                        },
                        {
                            preset: "islands#icon",
                            iconColor: feature.properties["marker-color"] || "#1E90FF", // Цвет иконки из GeoJSON
                            interactivityModel: 'default#geoObject', // Прокидываем события на карту
                            zIndex: 1000, // Высокий Z-индекс для видимости
                            interactiveZIndex: true // Включаем интерактивность по Z-индексу
                        }
                    );
                });

            // Добавляем объекты в кластеризатор
            clusterer.add(geoObjects);

            // Считаем пропорции сегментов (цветов) в кластере
            clusterer.events.add('objectsadd', function () {
                clusterer.getClusters().forEach(cluster => {
                    const colorCounts = {};
                    cluster.getGeoObjects().forEach(geoObject => {
                        const color = geoObject.properties.get('markerColor');
                        colorCounts[color] = (colorCounts[color] || 0) + 1;
                    });

                    const total = cluster.getGeoObjects().length;
                    let offset = 0;

                    const segments = Object.entries(colorCounts).map(([color, count]) => {
                        const percent = (count / total) * 100;
                        const segment = { color, percent, offset };
                        offset += (percent / 100) * 360; // Угол в градусах
                        return segment;
                    });

                    cluster.properties.set('segments', segments); // Устанавливаем сегменты для диаграммы
                });
            });

            // Добавляем кластеризатор на карту
            myMap.geoObjects.add(clusterer);

            // Устанавливаем границы карты в зависимости от кластеров
            myMap.setBounds(clusterer.getBounds(), {
                checkZoomRange: true
            });
        })
        .catch(error => {
            console.error("Ошибка загрузки GeoJSON:", error);
            alert("Не удалось загрузить файл GeoJSON. Проверьте, что файл находится в той же папке, что и index.html.");
        });

    // Отключаем автоматическое перемещение карты при отправке поиска
    searchControl.events.add('submit', function (e) {
        e.preventDefault(); // Останавливаем стандартное поведение (перемещение на найденное место)
    });

    // Обработка события выбора результата поиска
    searchControl.events.add('resultselect', function (e) {
        const index = e.get('index');
        searchControl.getResult(index).then(function (res) {
            const coords = res.geometry.getCoordinates();
            console.log('Выбранный объект:', res); // Лог результата поиска

            // Здесь не происходит перехода, только выводим информацию о выбранном объекте
            const selectedAddress = res.get('text'); // Адрес выбранного места
            alert("Вы выбрали: " + selectedAddress); // Просто выводим адрес
        });
    });

    // Обработка ошибок при поиске
    searchControl.events.add('error', function (e) {
        console.error("Ошибка поиска:", e.get('error'));
        alert("Произошла ошибка при выполнении поиска. Проверьте ваш запрос и повторите попытку.");
    });
});
