document.addEventListener("DOMContentLoaded", function () {
    // index.html에서 사용자가 검색한 키워드 받아옴
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    const food = params.get('food');
    const keywordInput = document.getElementById('keyword');
    const homeButton = document.querySelector('#home-button');

    homeButton.addEventListener("click", ()=> {
        window.history.back();
    })

    // index.html에서 도출된 4개 음식 키워드 가져옴
    const storedFoods = JSON.parse(localStorage.getItem('selectedFoods') || '[]');
    console.log(storedFoods);

    // 더보기 버튼 클릭하면 리스트 drawer 기능
    const selectedFoodsContainer = document.querySelector('.selectedFoods');
    plusBt.addEventListener('click', function () {
        selectedFoodsContainer.classList.toggle('open');
        menu_wrap.classList.toggle('open');
        this.classList.toggle('open');

        // 더보기버튼 클릭할 때마다 마이너스로 바뀌게 함
        if (this.classList.contains('fa-circle-plus')) {
            this.classList.remove('fa-circle-plus');
            this.classList.add('fa-circle-minus');
        } else {
            this.classList.remove('fa-circle-minus');
            this.classList.add('fa-circle-plus');
        }
    });

    if (city && food) {
        keywordInput.value = `${city} ${food}`;
    }

    // storedFoods를 리스트로 나열
    if (storedFoods.length > 0) {
        const selectedFoodsContainer = document.querySelector('.selectedFoods');
        const ul = document.createElement('ul');

    storedFoods.forEach(storedFood => {
        const li = document.createElement('li');
        li.textContent = storedFood;
        if (storedFood === food) {
            li.classList.add('selected');  // 현재 선택된 키워드 강조
        }
        li.addEventListener('click', function() {
            keywordInput.value = `${city} ${storedFood}`;
            searchPlaces();
            // 모든 li에서 'selected' 클래스 제거
            ul.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
            // 클릭된 li에 'selected' 클래스 추가
            li.classList.add('selected');
        });
        ul.appendChild(li);
    });
    selectedFoodsContainer.appendChild(ul);
}


    var markers = [];

    var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
        mapOption = {
            center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
            level: 3 // 지도의 확대 레벨
        };

    var map = new kakao.maps.Map(mapContainer, mapOption);
    var ps = new kakao.maps.services.Places();
    var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

    searchPlaces();

    function searchPlaces() {
        var keyword = document.getElementById('keyword').value;

        if (!keyword.replace(/^\s+|\s+$/g, '')) {
            alert('키워드를 입력해주세요!');
            return false;
        }
        // 검색할 때 지도 레벨 변경
        map.setLevel(2);
        ps.keywordSearch(keyword, placesSearchCB);
    }

    function placesSearchCB(data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {
            displayPlaces(data);
            displayPagination(pagination);
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            alert('검색 결과가 존재하지 않습니다.');
            return;
        } else if (status === kakao.maps.services.Status.ERROR) {
            alert('검색 결과 중 오류가 발생했습니다.');
            return;
        }
    }

    function displayPlaces(places) {
        var listEl = document.getElementById('placesList'),
            menuEl = document.getElementById('menu_wrap'),
            fragment = document.createDocumentFragment(),
            bounds = new kakao.maps.LatLngBounds(),
            listStr = '';

        removeAllChildNods(listEl);
        removeMarker();

        for (var i = 0; i < places.length; i++) {
            var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
                marker = addMarker(placePosition, i),
                itemEl = getListItem(i, places[i]);

            bounds.extend(placePosition);

            (function (marker, title) {
                kakao.maps.event.addListener(marker, 'mouseover', function () {
                    displayInfowindow(marker, title);
                });

                kakao.maps.event.addListener(marker, 'mouseout', function () {
                    infowindow.close();
                });

                itemEl.onmouseover = function () {
                    displayInfowindow(marker, title);
                };

                itemEl.onmouseout = function () {
                    infowindow.close();
                };
            })(marker, places[i].place_name);

            fragment.appendChild(itemEl);
        }

        listEl.appendChild(fragment);
        menuEl.scrollTop = 0;

        // 검색 결과 표시할 때 지도 레벨 설정
        map.setLevel(3);
        map.setBounds(bounds);
    }

    function getListItem(index, places) {
        var el = document.createElement('li'),
            itemStr = '<span class="markerbg marker_' + (index + 1) + '"></span>' +
                '<div class="info">' +
                '   <h5>' + places.place_name + '</h5>';

        if (places.road_address_name) {
            itemStr += '    <span>' + places.road_address_name + '</span>' +
                '   <span class="jibun gray">' + places.address_name + '</span>';
        } else {
            itemStr += '    <span>' + places.address_name + '</span>';
        }
        itemStr += '  <span class="tel">' + places.phone + '</span>' +
            '</div>';

        el.innerHTML = itemStr;
        el.className = 'item';

        return el;
    }

    function addMarker(position, idx, title) {
        var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
            imageSize = new kakao.maps.Size(36, 37),
            imgOptions = {
                spriteSize: new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
                spriteOrigin: new kakao.maps.Point(0, (idx * 46) + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
                offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
            },
            markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
            marker = new kakao.maps.Marker({
                position: position, // 마커의 위치
                image: markerImage
            });

        marker.setMap(map);
        markers.push(marker);

        return marker;
    }

    function removeMarker() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
    }

    // 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
    function displayPagination(pagination) {
        var paginationEl = document.getElementById('pagination'),
            fragment = document.createDocumentFragment(),
            i;

        // 기존에 추가된 페이지번호를 삭제합니다
        while (paginationEl.hasChildNodes()) {
            paginationEl.removeChild(paginationEl.lastChild);
        }

        for (i = 1; i <= pagination.last; i++) {
            var el = document.createElement('a');
            el.href = "#";
            el.innerHTML = i;

            if (i === pagination.current) {
                el.className = 'on';
            } else {
                el.onclick = (function (i) {
                    return function () {
                        pagination.gotoPage(i);
                    }
                })(i);
            }

            fragment.appendChild(el);
        }
        paginationEl.appendChild(fragment);
    }

    // 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
    // 인포윈도우에 장소명을 표시합니다
    function displayInfowindow(marker, title) {
        var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';

        infowindow.setContent(content);
        infowindow.open(map, marker);
    }

    // 검색결과 목록의 자식 Element를 제거하는 함수입니다
    function removeAllChildNods(el) {
        while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
        }
    }

    // // 이 중에 하나쯤은 있겠지 리스트에서 키워드 선택시 지도 다시 출력
    // document.querySelectorAll('.categories li').forEach(item => {
    //     item.addEventListener('click', function() {
    //         const selectedFood = this.getAttribute('data-food');
    //         keywordInput.value = `${city} ${selectedFood}`;
    //         searchPlaces();
    //     });
    // });

    // 룰렛 돌려보기 버튼 클릭시 룰렛페이지로 이동
    const goRoulette = document.getElementById('go-roulette');
    goRoulette.addEventListener('click', ()=> {
        window.location.href = 'roulette.html';
    })

});