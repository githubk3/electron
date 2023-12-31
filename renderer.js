// handle select folder
const selectFolderBtn = document.querySelector(".btn__folder--select");
const filePathElement = document.getElementById("folder__input");

selectFolderBtn.addEventListener("click", async () => {
    const filePath = await window.test.openFile();
    filePathElement.value = filePath;
});

const singleVideoElement = document.getElementById(
    "box__content__single-video"
);
const multiVideoElement = document.getElementById("box__content__multi-video");

// handle select dropdown menu
const dropdownElements = document.querySelectorAll(".dropdown");

dropdownElements.forEach((dropdownElement) => {
    dropdownElement.onmouseover = function () {
        if (!this.classList.contains("is-active")) {
            this.classList.add("is-active");
        }
    };

    dropdownElement.onmouseout = function () {
        if (this.classList.contains("is-active")) {
            this.classList.remove("is-active");
        }
    };
});

const listOptionItem = document.querySelectorAll(
    ".option__dropdown-menu .dropdown-item"
);

listOptionItem.forEach((dropItem) => {
    dropItem.onmouseover = function () {
        this.style.opacity = 0.8;
    };

    dropItem.onmouseout = function () {
        this.style.opacity = 1;
    };

    dropItem.onclick = function () {
        document.querySelector(".option__name").textContent = this.textContent;
        if (this.classList.contains("select__single-video")) {
            singleVideoElement.classList.remove("is-hidden");
            multiVideoElement.classList.add("is-hidden");
        }
        if (this.classList.contains("select__multi-video")) {
            singleVideoElement.classList.add("is-hidden");
            multiVideoElement.classList.remove("is-hidden");
        }
    };
});

// handle enter input link and fetch infor video
const btnInfoSendLink = document.querySelector(".btn__info--send");

let dataSingleVideo;
btnInfoSendLink.onclick = async function () {
    const inputValue = singleVideoElement.querySelector("input").value;

    if (!inputValue) {
        console.log("Invalid value");
    } else {
        this.classList.add("is-loading");
        const res = await window.test.handleGetDataSingleLink(inputValue);
        dataSingleVideo = res.data;
        this.classList.remove("is-loading");

        if (res.statusCode === 200) {
            const videoInfoElement = `<div >
            <h3>
                Mô tả:
                <span>
                    ${res.data.desc}
                </span>
            </h3>

            <div>
                <ul class="is-flex">
                    <li>
                        <span>
                            <i class="fa-solid fa-user"></i>
                        </span>
                        John Doe
                    </li>
                    <li class="ml-2">
                        <span>
                            <i class="fa-solid fa-eye"></i>
                        </span>
                        ${res.data.view}
                    </li>
                    <li class="ml-2">
                        <span>
                            <i class="fa-solid fa-database"></i>
                        </span>
                        2.3MB
                    </li>
                </ul>
            </div>

            <div class="mt-2">
                <button class="button is-primary ml-2 btn--download">
                    <span class="icon">
                        <i class="fas fa-download"></i>
                    </span>
                    <span>Download</span>
                </button>

                <button
                    class="button is-primary is-hidden btn--success"
                >
                    <span class="icon-text">
                        <span class="icon">
                            <i class="fas fa-check-square"></i>
                        </span>
                        <span>Success</span>
                    </span>
                </button>
            </div>
        </div>`;

            singleVideoElement.querySelector(".single__video-info").innerHTML =
                videoInfoElement;

            // download video
            const btnDownloadSingleVideo = singleVideoElement.querySelector(
                ".single__video-info .btn--download"
            );

            btnDownloadSingleVideo.onclick = async function () {
                this.classList.add("is-loading");

                const res = await window.test.handleDownloadVideoByUrl({
                    data: dataSingleVideo,
                    folder: filePathElement.value,
                });

                if (res.statusCode === 200) {
                    this.classList.add("is-hidden");
                    this.classList.remove("is-loading");
                    singleVideoElement
                        .querySelector(".single__video-info .btn--success")
                        .classList.remove("is-hidden");
                } else {
                    this.classList.remove("is-loading");
                }
            };
        } else {
            singleVideoElement.querySelector(
                ".single__video-info"
            ).innerHTML = `<div>${res.message}</div>`;
        }
    }
};

// handle multi video
const btnUsernameSend = multiVideoElement.querySelector(".btn__username--send");

let listDataAll = [];
let filterData = [];

function updateListDataTableDOM() {
    const filterOption =
        multiVideoElement.querySelector(".filter__name").textContent;
    if (filterOption.includes("All")) {
        filterData = listDataAll;
    } else if (filterOption.includes("0 - 100K")) {
        filterData = listDataAll.filter((item) => item.view < 100000);
    } else if (filterOption.includes("100K - 500K")) {
        filterData = listDataAll.filter(
            (item) => item.view >= 100000 && item.view <= 500000
        );
    } else {
        filterData = listDataAll.filter((item) => item.view > 500000);
    }

    const listItemElement =
        filterData.length > 0
            ? filterData
                  .map((item, index) => {
                      `<tr>
                        <th>${index}</th>
                        <td>
                            <span>
                                ${item.desc && item.desc}
                            </span>
                        </td>
                        <td>${item.view}</td>
                        <td>2.3MB</td>
                        <td>
                            <button class="button is-primary ml-2">
                                <span class="icon">
                                    <i class="fas fa-download"></i>
                                </span>
                                <span>Download</span>
                            </button>
                        </td>
                        </tr>`;
                  })
                  .join("")
            : "<p>No results</p>";

    const tableElement = `
        <div>
            <p>Tổng số video: ${filterData.length}</p>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>Pos</th>
                    <th>Description</th>
                    <th>View</th>
                    <th>Size</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>
                    ${listItemElement}
            </tbody>
        </table>`;

    multiVideoElement.querySelector(".list__data").innerHTML = tableElement;

    filterData.length > 0 &&
        multiVideoElement
            .querySelector(".btn--download__list")
            .removeAttribute("disabled");

    multiVideoElement.querySelector(".btn--download__list").onclick =
        async function () {
            this.classList.add("is-loading");
            this.querySelector(".text-download__list").textContent = "Cancel";

            // handle download multi video
            const res = await window.test.hanldeDownloadVideoFromListByUsername(
                {
                    dataList: filterData,
                    folder: filePathElement.value,
                }
            );

            if (res.statusCode === 200) {
                console.log(res.message);
            } else {
                console.log(res.message);
            }

            this.querySelector(".text-download__list").textContent = "Download";
            this.classList.remove("is-loading");
        };
}

//
btnUsernameSend.onclick = async function () {
    const inputValue = multiVideoElement.querySelector("input").value;

    if (!inputValue) {
        console.log("Invalid input");
    } else {
        this.classList.add("is-loading");
        const res = await window.test.handleGetListDataByUsername(inputValue);
        listDataAll =
            res.totalGoodData > 0 &&
            res.goodData.filter((item) => item !== undefined);
        this.classList.remove("is-loading");

        updateListDataTableDOM();

        if (res.statusCode === 200) {
        } else {
            const errorElement = `<p>${res.message}</p>`;
            multiVideoElement.appendChild(errorElement);
        }
    }
};

// list dropdown item filters
const listFilters = multiVideoElement.querySelectorAll(".dropdown-item");

listFilters.forEach((filterItem) => {
    filterItem.onmouseover = function () {
        this.style.opacity = 0.8;
    };

    filterItem.onmouseout = function () {
        this.style.opacity = 1;
    };

    filterItem.onclick = function () {
        multiVideoElement.querySelector(".filter__name").textContent =
            this.textContent;

        updateListDataTableDOM();
    };
});
