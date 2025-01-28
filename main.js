ymaps.ready(function () {
    const myMap = new ymaps.Map('map', {
        center: [55.751574, 37.573856], // Центр карты
        zoom: 9, // Уровень масштаба
        controls: ['zoomControl', 'geolocationControl'] // Оставляем только нужные контролы
    }, {
        // Включаем мультитач масштабирование карты
        multiTouch: true,
        // Отключаем автоматический захват событий на метках
        behaviors: ['default', 'multiTouch']
    });

    const clusterer = new ymaps.Clusterer({
        clusterIconLayout: 'default#pieChart', // Макет кластеров
        clusterIconPieChartRadius: 25,
        clusterIconPieChartCoreRadius: 10,
        clusterIconPieChartStrokeWidth: 3,
        hasBalloon: false, // Без всплывающего окна
        interactivityModel: 'default#opaque' // Отключаем перехват событий
    });

    // Загружаем GeoJSON и создаем метки
    fetch('open.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            const geoObjects = geojsonData.features
                .filter(feature => feature.geometry.type === "Point") // Только точки
                .map(feature => {
                    const coordinates = feature.geometry.coordinates;
                    return new ymaps.Placemark(
                        [coordinates[1], coordinates[0]], // Широта и долгота
                        {
                            hintContent: feature.properties.description,
                            balloonContent: feature.properties.description,
                            markerColor: feature.properties["marker-color"] || "#1E90FF"
                        },
                        {
                            preset: "islands#icon",
                            iconColor: feature.properties["marker-color"] || "#1E90FF",
                            interactivityModel: 'default#opaque' // Отключаем перехват событий
                        }
                    );
                });

            // Добавляем метки в кластеризатор
            clusterer.add(geoObjects);

            // Добавляем кластеризатор на карту
            myMap.geoObjects.add(clusterer);

            // Обрабатываем нажатия на кластеры
            clusterer.events.add('click', function (e) {
                const target = e.get('target'); // Получаем кластер
                if (target && target.properties.get('geoObjects')) {
                    // Если это кластер, то зуммируем карту к его границам
                    myMap.setBounds(target.getBounds(), {
                        checkZoomRange: true
                    });
                }
            });

            // Обрабатываем нажатия на метки
            geoObjects.forEach(placemark => {
                placemark.events.add('click', function () {
                    // Открываем балун метки
                    placemark.balloon.open();
                });
            });
        })
        .catch(error => {
            console.error("Ошибка загрузки GeoJSON:", error);
        });

    // Отключаем автоматическое масштабирование карты при касаниях меток
    myMap.geoObjects.options.set({
        interactivityModel: 'default#opaque'
    });
});
