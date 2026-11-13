/**
 * COVID-19 Tracker - Main Application Logic
 * Real-time data integration with disease.sh & Apify
 * With Light/Dark Theme Switching (Default: Light/Bright Mode)
 */

// Global State
let globalCountriesStat = [];
let globalVnDetail = [];
let currentWorldLimit = 50;
let cachedChartData = null;
const chartInstances = {};

/**
 * Theme Management
 * Default: Bright / Light Mode
 */
function initTheme() {
    const savedTheme = localStorage.getItem("covid19_theme") || "light";
    setTheme(savedTheme, false);

    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme") || "light";
            const target = current === "dark" ? "light" : "dark";
            setTheme(target, true);
        });
    }
}

function setTheme(theme, updateCharts) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
        localStorage.setItem("covid19_theme", theme);
    } catch (e) {}

    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.content = theme;

    const toggleText = document.querySelector(".theme-toggle-text");
    if (toggleText) {
        toggleText.textContent = theme === "dark" ? "Chế độ sáng" : "Chế độ tối";
    }

    if (updateCharts && cachedChartData) {
        renderAllCharts(cachedChartData);
    }
}

function getChartThemeColors() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    return {
        gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        tickColor: isDark ? '#94a3b8' : '#475569',
        titleColor: isDark ? '#f8fafc' : '#0f172a'
    };
}

/**
 * Fetch Vietnam COVID-19 data
 */
async function getDataVN() {
    try {
        const responseData = await fetch("https://api.apify.com/v2/key-value-stores/ZsOpZgeg7dFS1rgfM/records/LATEST");
        if (!responseData.ok) throw new Error("HTTP error " + responseData.status);
        const data = await responseData.json();
        return { data };
    } catch (err) {
        console.warn("Apify VN failed, attempting fallback:", err.message);
        try {
            const fallbackRes = await fetch("https://disease.sh/v3/covid-19/countries/vietnam");
            const fb = await fallbackRes.json();
            return {
                data: {
                    infected: fb.cases || 0,
                    deceased: fb.deaths || 0,
                    recovered: fb.recovered || 0,
                    treated: fb.active || 0,
                    detail: []
                }
            };
        } catch (e2) {
            console.error("All VN data sources failed:", e2);
            return {
                data: { infected: 0, deceased: 0, recovered: 0, treated: 0, detail: [] }
            };
        }
    }
}

/**
 * Fetch World COVID-19 data from disease.sh
 */
async function getDataWorld() {
    try {
        const [resAll, resCountries] = await Promise.all([
            fetch("https://disease.sh/v3/covid-19/all"),
            fetch("https://disease.sh/v3/covid-19/countries")
        ]);

        if (!resAll.ok || !resCountries.ok) {
            throw new Error("Failed to fetch world data from disease.sh");
        }

        const all = await resAll.json();
        const countries = await resCountries.json();

        // Sort countries descending by total confirmed cases
        countries.sort((a, b) => b.cases - a.cases);

        const statistic_taken_at = new Date(all.updated || Date.now()).toLocaleString('vi-VN');
        const fatalityRate = all.cases > 0 ? ((all.deaths / all.cases) * 100).toFixed(2) + '%' : '0%';

        const world_total = {
            total_cases: all.cases || 0,
            new_cases: all.todayCases || 0,
            total_deaths: all.deaths || 0,
            new_deaths: all.todayDeaths || 0,
            total_recovered: all.recovered || 0,
            new_recovered: all.todayRecovered || 0,
            fatality: fatalityRate,
            affected_countries: all.affectedCountries || countries.length
        };

        const countries_stat = countries.map(c => ({
            country_name: c.country,
            cases: (c.cases || 0).toLocaleString('vi-VN'),
            new_cases: c.todayCases ? (c.todayCases).toLocaleString('vi-VN') : '0',
            deaths: (c.deaths || 0).toLocaleString('vi-VN'),
            new_deaths: c.todayDeaths ? (c.todayDeaths).toLocaleString('vi-VN') : '0',
            total_recovered: (c.recovered || 0).toLocaleString('vi-VN'),
            active: (c.active || 0).toLocaleString('vi-VN'),
            iso2: c.countryInfo?.iso2 || '',
            flag: c.countryInfo?.flag || '',
            raw_cases: c.cases || 0,
            raw_deaths: c.deaths || 0,
            raw_recovered: c.recovered || 0
        }));

        return {
            world_total,
            countries_stat,
            statistic_taken_at
        };
    } catch (err) {
        console.error("getDataWorld failed:", err);
        return {
            world_total: {
                total_cases: 0,
                new_cases: 0,
                total_deaths: 0,
                new_deaths: 0,
                total_recovered: 0,
                fatality: "0%",
                affected_countries: 0
            },
            countries_stat: [],
            statistic_taken_at: new Date().toLocaleString('vi-VN')
        };
    }
}

/**
 * Render World Dashboard Cards
 */
function renderDashboardWorld(confirmed, new_cases, death, new_deaths, released, fatality, affectedCountries) {
    const elConfirmed = document.querySelector(".world .confirmed.number");
    const elConfirmedDiff = document.querySelector(".world .confirmed.diff");
    const elDeath = document.querySelector(".world .death.number");
    const elDeathDiff = document.querySelector(".world .death.diff");
    const elReleased = document.querySelector(".world .released.number");
    const elFatality = document.querySelector(".world .fatality.number");
    const elCountry = document.querySelector(".world .country.number");

    if (elConfirmed) elConfirmed.dataset.target = confirmed;
    if (elConfirmedDiff) {
        elConfirmedDiff.textContent = new_cases && new_cases > 0 ? "(+" + numberWithCommas(new_cases) + ")" : "";
        elConfirmedDiff.style.display = new_cases && new_cases > 0 ? "inline-block" : "none";
    }

    if (elDeath) elDeath.dataset.target = death;
    if (elDeathDiff) {
        elDeathDiff.textContent = new_deaths && new_deaths > 0 ? "(+" + numberWithCommas(new_deaths) + ")" : "";
        elDeathDiff.style.display = new_deaths && new_deaths > 0 ? "inline-block" : "none";
    }

    if (elReleased) elReleased.dataset.target = released;
    if (elFatality) elFatality.textContent = fatality;
    if (elCountry) elCountry.dataset.target = affectedCountries || 231;
}

/**
 * Render Vietnam Dashboard Cards
 */
function renderDashboardVn(confirmed, death, released, fatality, provinces) {
    const elConfirmed = document.querySelector(".vn .confirmed.number");
    const elDeath = document.querySelector(".vn .death.number");
    const elReleased = document.querySelector(".vn .released.number");
    const elFatality = document.querySelector(".vn .fatality.number");
    const elProvinces = document.querySelector(".vn .provinces.number");

    if (elConfirmed) elConfirmed.dataset.target = confirmed;
    if (elDeath) elDeath.dataset.target = death;
    if (elReleased) elReleased.dataset.target = released;
    if (elFatality) elFatality.dataset.target = fatality;
    if (elProvinces) elProvinces.dataset.target = provinces;
}

function removeComma(num) {
    if (!num) return '0';
    return String(num).replace(/,/g, '').replace(/\./g, '');
}

var state_specific = {
    VNM429: {
        name: "Quảng Ninh"
    },
    VNM444: {
        name: "Tây Ninh"
    },
    VNM450: {
        name: "Điện Biên"
    },
    VNM451: {
        name: "Bắc Kạn"
    },
    VNM452: {
        name: "Thái Nguyên"
    },
    VNM453: {
        name: "Lai Châu"
    },
    VNM454: {
        name: "Lạng Sơn"
    },
    VNM455: {
        name: "Sơn La"
    },
    VNM456: {
        name: "Thanh Hóa"
    },
    VNM457: {
        name: "Tuyên Quang"
    },
    VNM458: {
        name: "Yên Bái"
    },
    VNM459: {
        name: "Hòa Bình"
    },
    VNM460: {
        name: "Hải Dương"
    },
    VNM4600: {
        name: "Hải Phòng"
    },
    VNM461: {
        name: "Hưng Yên"
    },
    VNM462: {
        name: "Hà Nội"
    },
    VNM463: {
        name: "Bắc Ninh"
    },
    VNM464: {
        name: "Vĩnh Phúc"
    },
    VNM466: {
        name: "Ninh Bình"
    },
    VNM467: {
        name: "Hà Nam"
    },
    VNM468: {
        name: "Nam Định"
    },
    VNM469: {
        name: "Phú Thọ"
    },
    VNM470: {
        name: "Bắc Giang"
    },
    VNM471: {
        name: "Thái Bình"
    },
    VNM474: {
        name: "Hà Tĩnh"
    },
    VNM475: {
        name: "Nghệ An"
    },
    VNM476: {
        name: "Quảng Bình"
    },
    VNM477: {
        name: "Đắk Lắk"
    },
    VNM478: {
        name: "Gia Lai"
    },
    VNM479: {
        name: "Khánh Hòa"
    },
    VNM480: {
        name: "Lâm Đồng"
    },
    VNM481: {
        name: "Ninh Thuận"
    },
    VNM482: {
        name: "Phú Yên"
    },
    VNM483: {
        name: "Bình Dương"
    },
    VNM4834: {
        name: "Tiền Giang"
    },
    VNM4835: {
        name: "Đắk Nông"
    },
    VNM484: {
        name: "Bình Phước"
    },
    VNM485: {
        name: "Bình Định"
    },
    VNM486: {
        name: "Kon Tum"
    },
    VNM487: {
        name: "Quảng Nam"
    },
    VNM488: {
        name: "Quảng Ngãi"
    },
    VNM489: {
        name: "Quảng Trị"
    },
    VNM490: {
        name: "Thừa Thiên Huế"
    },
    VNM491: {
        name: "Đà Nẵng"
    },
    VNM495: {
        name: "Bà Rịa – Vũng Tàu"
    },
    VNM496: {
        name: "Bình Thuận"
    },
    VNM497: {
        name: "Đồng Nai"
    },
    VNM498: {
        name: "An Giang"
    },
    VNM499: {
        name: "Cần Thơ"
    },
    VNM500: {
        name: "Đồng Tháp"
    },
    VNM501: {
        name: "Hồ Chí Minh",
        inactive: "no"
    },
    VNM502: {
        name: "Kiên Giang"
    },
    VNM503: {
        name: "Long An"
    },
    VNM504: {
        name: "Bến Tre"
    },
    VNM505: {
        name: "Hậu Giang"
    },
    VNM506: {
        name: "Bạc Liêu"
    },
    VNM507: {
        name: "Cà Mau"
    },
    VNM508: {
        name: "Sóc Trăng"
    },
    VNM509: {
        name: "Trà Vinh"
    },
    VNM510: {
        name: "Vĩnh Long"
    },
    VNM511: {
        name: "Cao Bằng"
    },
    VNM512: {
        name: "Hà Giang"
    },
    VNM5483: {
        name: "Lào Cai"
    }
}


var state_specific_world = {
    AF: {
        name: "Afghanistan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    AO: {
        name: "Angola",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    AL: {
        name: "Albania",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    AE: {
        name: "UAE",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    AR: {
        name: "Argentina",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    AM: {
        name: "Armenia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    AU: {
        name: "Australia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    AT: {
        name: "Austria",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    AZ: {
        name: "Azerbaijan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BI: {
        name: "Burundi",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BE: {
        name: "Belgium",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BJ: {
        name: "Benin",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BF: {
        name: "Burkina Faso",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BD: {
        name: "Bangladesh",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BG: {
        name: "Bulgaria",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BH: {
        name: "Bahrain",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BA: {
        name: "Bosnia and Herzegovina",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BY: {
        name: "Belarus",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BZ: {
        name: "Belize",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BO: {
        name: "Bolivia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BR: {
        name: "Brazil",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BN: {
        name: "Brunei Darussalam",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BT: {
        name: "Bhutan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BW: {
        name: "Botswana",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CF: {
        name: "Central African Republic",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CA: {
        name: "Canada",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CH: {
        name: "Switzerland",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CL: {
        name: "Chile",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CN: {
        name: "China",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CI: {
        name: "Côte d'Ivoire",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CM: {
        name: "Cameroon",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CD: {
        name: "Congo",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CG: {
        name: "Republic of Congo",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CO: {
        name: "Colombia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CR: {
        name: "Costa Rica",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CU: {
        name: "Cuba",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CZ: {
        name: "Czech Republic",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    DE: {
        name: "Germany",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    DJ: {
        name: "Djibouti",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    DK: {
        name: "Denmark",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    DO: {
        name: "Dominican Republic",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    DZ: {
        name: "Algeria",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    EC: {
        name: "Ecuador",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    EG: {
        name: "Egypt",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    ER: {
        name: "Eritrea",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    EE: {
        name: "Estonia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    ET: {
        name: "Ethiopia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    FI: {
        name: "Finland",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    FJ: {
        name: "Fiji",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GA: {
        name: "Gabon",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GB: {
        name: "UK",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GE: {
        name: "Georgia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GH: {
        name: "Ghana",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GN: {
        name: "Guinea",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GM: {
        name: "The Gambia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GW: {
        name: "Guinea-Bissau",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GQ: {
        name: "Equatorial Guinea",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GR: {
        name: "Greece",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GL: {
        name: "Greenland",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GT: {
        name: "Guatemala",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GY: {
        name: "Guyana",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    HN: {
        name: "Honduras",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    HR: {
        name: "Croatia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    HT: {
        name: "Haiti",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    HU: {
        name: "Hungary",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    ID: {
        name: "Indonesia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    IN: {
        name: "India",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    IE: {
        name: "Ireland",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    IR: {
        name: "Iran",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    IQ: {
        name: "Iraq",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    IS: {
        name: "Iceland",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    IL: {
        name: "Israel",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    IT: {
        name: "Italy",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    JM: {
        name: "Jamaica",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    JO: {
        name: "Jordan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    JP: {
        name: "Japan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    KZ: {
        name: "Kazakhstan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    KE: {
        name: "Kenya",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    KG: {
        name: "Kyrgyzstan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    KH: {
        name: "Cambodia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    KR: {
        name: "S. Korea",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    XK: {
        name: "Kosovo",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    KW: {
        name: "Kuwait",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    LA: {
        name: "Laos",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    LB: {
        name: "Lebanon",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    LR: {
        name: "Liberia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    LY: {
        name: "Libya",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    LK: {
        name: "Sri Lanka",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    LS: {
        name: "Lesotho",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    LT: {
        name: "Lithuania",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    LU: {
        name: "Luxembourg",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    LV: {
        name: "Latvia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MA: {
        name: "Morocco",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MD: {
        name: "Moldova",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MG: {
        name: "Madagascar",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MX: {
        name: "Mexico",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MK: {
        name: "Macedonia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    ML: {
        name: "Mali",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MM: {
        name: "Myanmar",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    ME: {
        name: "Montenegro",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MN: {
        name: "Mongolia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MZ: {
        name: "Mozambique",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MR: {
        name: "Mauritania",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MW: {
        name: "Malawi",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MY: {
        name: "Malaysia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    NA: {
        name: "Namibia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    NE: {
        name: "Niger",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    NG: {
        name: "Nigeria",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    NI: {
        name: "Nicaragua",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    NL: {
        name: "Netherlands",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    NO: {
        name: "Norway",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    NP: {
        name: "Nepal",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    NZ: {
        name: "New Zealand",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    OM: {
        name: "Oman",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    PK: {
        name: "Pakistan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    PA: {
        name: "Panama",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    PE: {
        name: "Peru",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    PH: {
        name: "Philippines",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    PG: {
        name: "Papua New Guinea",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    PL: {
        name: "Poland",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    KP: {
        name: "Dem. Rep. Korea",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    PT: {
        name: "Portugal",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    PY: {
        name: "Paraguay",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    PS: {
        name: "Palestine",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    QA: {
        name: "Qatar",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    RO: {
        name: "Romania",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    RU: {
        name: "Russia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    RW: {
        name: "Rwanda",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    EH: {
        name: "Western Sahara",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SA: {
        name: "Saudi Arabia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SD: {
        name: "Sudan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SS: {
        name: "South Sudan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SN: {
        name: "Senegal",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SL: {
        name: "Sierra Leone",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SV: {
        name: "El Salvador",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    RS: {
        name: "Serbia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SR: {
        name: "Suriname",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SK: {
        name: "Slovakia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SI: {
        name: "Slovenia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SE: {
        name: "Sweden",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SZ: {
        name: "Swaziland",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SY: {
        name: "Syria",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TD: {
        name: "Chad",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TG: {
        name: "Togo",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TH: {
        name: "Thailand",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TJ: {
        name: "Tajikistan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TM: {
        name: "Turkmenistan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TL: {
        name: "Timor-Leste",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TN: {
        name: "Tunisia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TR: {
        name: "Turkey",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TW: {
        name: "Taiwan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TZ: {
        name: "Tanzania",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    UG: {
        name: "Uganda",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    UA: {
        name: "Ukraine",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    UY: {
        name: "Uruguay",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    US: {
        name: "USA",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    UZ: {
        name: "Uzbekistan",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    VE: {
        name: "Venezuela",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    VN: {
        name: "Vietnam",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    VU: {
        name: "Vanuatu",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    YE: {
        name: "Yemen",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    ZA: {
        name: "South Africa",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    ZM: {
        name: "Zambia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    ZW: {
        name: "Zimbabwe",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SO: {
        name: "Somalia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GF: {
        name: "France",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    FR: {
        name: "France",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    ES: {
        name: "Spain",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    AW: {
        name: "Aruba",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    AI: {
        name: "Anguilla",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    AD: {
        name: "Andorra",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    AG: {
        name: "Antigua and Barbuda",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BS: {
        name: "Bahamas",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BM: {
        name: "Bermuda",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    BB: {
        name: "Barbados",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    KM: {
        name: "Comoros",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CV: {
        name: "Cape Verde",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    KY: {
        name: "Cayman Islands",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    DM: {
        name: "Dominica",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    FK: {
        name: "Falkland Islands",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    FO: {
        name: "Faeroe Islands",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GD: {
        name: "Grenada",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    HK: {
        name: "Hong Kong",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    KN: {
        name: "Saint Kitts and Nevis",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    LC: {
        name: "Saint Lucia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    LI: {
        name: "Liechtenstein",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MF: {
        name: "Saint Martin (French)",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MV: {
        name: "Maldives",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MT: {
        name: "Malta",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MS: {
        name: "Montserrat",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MU: {
        name: "Mauritius",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    NC: {
        name: "New Caledonia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    NR: {
        name: "Nauru",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    PN: {
        name: "Pitcairn Islands",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    PR: {
        name: "Puerto Rico",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    PF: {
        name: "French Polynesia",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SG: {
        name: "Singapore",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SB: {
        name: "Solomon Islands",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    ST: {
        name: "São Tomé and Principe",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SX: {
        name: "Saint Martin (Dutch)",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    SC: {
        name: "Seychelles",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TC: {
        name: "Turks and Caicos Islands",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TO: {
        name: "Tonga",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    TT: {
        name: "Trinidad and Tobago",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    VC: {
        name: "Saint Vincent and the Grenadines",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    VG: {
        name: "British Virgin Islands",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    VI: {
        name: "United States Virgin Islands",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CY: {
        name: "Cyprus",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    RE: {
        name: "Reunion (France)",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    YT: {
        name: "Mayotte (France)",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    MQ: {
        name: "Martinique (France)",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    GP: {
        name: "Guadeloupe (France)",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    CW: {
        name: "Curaco (Netherlands)",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    },
    IC: {
        name: "Canary Islands (Spain)",
        description: "default",
        color: "default",
        hover_color: "default",
        url: "default"
    }
}


// ==========================================
// TABLE & MAP RENDERING LOGIC
// ==========================================



// ==========================================
// TABLE & MAP RENDERING LOGIC
// ==========================================

const colors = [
    "#ffebee",
    "#ffcdd2",
    "#ef9a9a",
    "#e57373",
    "#ef5350",
    "#f44336",
    "#e53935",
    "#b71c1c"
];

function setColorMap(value) {
    if (value >= 1 && value <= 100) return colors[1];
    if (value > 100 && value <= 1000) return colors[2];
    if (value > 1000 && value <= 5000) return colors[3];
    if (value > 5000 && value <= 20000) return colors[4];
    if (value > 20000 && value <= 50000) return colors[5];
    if (value > 50000 && value <= 100000) return colors[6];
    if (value > 100000) return colors[7];
    return colors[0];
}

function setColoMapWorld(value) {
    if (value >= 10000 && value <= 100000) return colors[1];
    if (value > 100000 && value <= 500000) return colors[2];
    if (value > 500000 && value <= 1000000) return colors[3];
    if (value > 1000000 && value <= 5000000) return colors[4];
    if (value > 5000000 && value <= 10000000) return colors[5];
    if (value > 10000000 && value <= 50000000) return colors[6];
    if (value > 50000000) return colors[7];
    return colors[0];
}

function removeAccents(str) {
    if (!str) return '';
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .toLowerCase()
        .trim();
}

function normalizeVnName(s) {
    return removeAccents(s)
        .replace(/^(tinh|tp|tp\.|thanh pho)\s+/g, '')
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const vnProvinceAliases = {
    'dong bac': 'bac kan',
    'dong nam bo': 'dong nai',
    'dak lak': 'dak lak',
    'quang nam': 'quang nam',
    'ba ria vung tau': 'ba ria vung tau'
};

/**
 * Render Vietnam Table and Map Data
 */
function createTable(detail) {
    globalVnDetail = Array.isArray(detail) ? [...detail] : [];
    globalVnDetail.sort((a, b) => (b.cases || 0) - (a.cases || 0));

    // Update map data
    for (const item of globalVnDetail) {
        const dNorm = normalizeVnName(item.name);
        for (const property in state_specific) {
            const sNorm = normalizeVnName(state_specific[property].name);
            if (dNorm === sNorm || vnProvinceAliases[sNorm] === dNorm || sNorm.includes(dNorm) || dNorm.includes(sNorm)) {
                state_specific[property].color = setColorMap(parseInt(item.cases) || 0);
                state_specific[property].description = `
                    <div class="map-tooltip-content">
                        <strong class="map-tooltip-title">${item.name}</strong>
                        <div>Số ca nhiễm: <span class="badge badge-info text-light">${(item.cases || 0).toLocaleString('vi-VN')}</span></div>
                        <div>Số ca khỏi: <span class="badge badge-success text-light">${(item.recovered || 0).toLocaleString('vi-VN')}</span></div>
                        <div>Tử vong: <span class="badge badge-danger text-light">${(item.death || 0).toLocaleString('vi-VN')}</span></div>
                        ${item.casesToday ? `<div>Ca hôm nay: <span class="badge badge-warning text-dark">+${item.casesToday}</span></div>` : ''}
                    </div>
                `;
                break;
            }
        }
    }

    renderVnTableRows(globalVnDetail);
}

function renderVnTableRows(items) {
    const tbody = document.querySelector("#table-vn tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Không tìm thấy dữ liệu phù hợp.</td></tr>';
        return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <th scope="row" class="text-muted">${index + 1}</th>
            <td class="font-weight-bold text-left">${item.name}</td>
            <td class="text-right text-primary font-weight-bold">${(item.cases || 0).toLocaleString('vi-VN')}</td>
            <td class="text-right text-success">${(item.recovered || 0).toLocaleString('vi-VN')}</td>
            <td class="text-right text-danger font-weight-bold">${(item.death || 0).toLocaleString('vi-VN')}</td>
        `;
        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}

/**
 * Render World Table Rows
 */
function renderWorldTableRows(items, limit = currentWorldLimit) {
    const tbody = document.querySelector("#table-world tbody");
    const btnMore = document.getElementById("btn-show-more-world");
    if (!tbody) return;

    const visibleItems = items.slice(0, limit);
    tbody.innerHTML = "";

    if (visibleItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Không tìm thấy quốc gia phù hợp.</td></tr>';
        if (btnMore) btnMore.style.display = "none";
        return;
    }

    const fragment = document.createDocumentFragment();
    visibleItems.forEach((c, index) => {
        const tr = document.createElement("tr");
        const flagHtml = c.flag ? `<img src="${c.flag}" alt="" class="country-flag mr-2" width="22" height="15" loading="lazy">` : '';
        const newCasesHtml = c.new_cases && c.new_cases !== '0' ? `<br><span class="badge badge-pill badge-danger-soft text-danger diff-badge">+ ${c.new_cases}</span>` : '';
        const newDeathsHtml = c.new_deaths && c.new_deaths !== '0' ? `<br><span class="badge badge-pill badge-danger-soft text-danger diff-badge">+ ${c.new_deaths}</span>` : '';

        tr.innerHTML = `
            <th scope="row" class="text-muted">${index + 1}</th>
            <td class="text-left font-weight-bold d-flex align-items-center">
                ${flagHtml}
                <span>${c.country_name}</span>
            </td>
            <td class="text-right font-weight-bold text-primary">
                ${c.cases} ${newCasesHtml}
            </td>
            <td class="text-right font-weight-bold text-danger">
                ${c.deaths} ${newDeathsHtml}
            </td>
            <td class="text-right text-success font-weight-bold">
                ${c.total_recovered}
            </td>
        `;
        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);

    if (btnMore) {
        if (limit >= items.length) {
            btnMore.style.display = "none";
        } else {
            btnMore.style.display = "inline-block";
            btnMore.textContent = `Xem thêm (${visibleItems.length}/${items.length})`;
        }
    }
}

/**
 * Configure World Map data
 */
function createTableWorld(countries) {
    globalCountriesStat = Array.isArray(countries) ? [...countries] : [];

    // Map countries into state_specific_world for map rendering
    const byIso2 = new Map();
    const byName = new Map();
    globalCountriesStat.forEach(c => {
        if (c.iso2) byIso2.set(c.iso2.toUpperCase(), c);
        if (c.country_name) byName.set(c.country_name.toLowerCase(), c);
    });

    for (const property in state_specific_world) {
        const sName = (state_specific_world[property].name || "").toLowerCase();
        const c = byIso2.get(property.toUpperCase()) || byName.get(sName);
        if (c) {
            state_specific_world[property].color = setColoMapWorld(c.raw_cases);
            state_specific_world[property].description = `
                <div class="map-tooltip-content">
                    <strong class="map-tooltip-title">${c.country_name}</strong>
                    <div>Số ca nhiễm: <span class="badge badge-info text-light">${c.cases}</span></div>
                    <div>Đã khỏi: <span class="badge badge-success text-light">${c.total_recovered}</span></div>
                    <div>Tử vong: <span class="badge badge-danger text-light">${c.deaths}</span></div>
                </div>
            `;
        }
    }

    renderWorldTableRows(globalCountriesStat, currentWorldLimit);
}

function showMoreCountries() {
    currentWorldLimit += 50;
    const searchVal = (document.getElementById("search-world")?.value || "").toLowerCase().trim();
    const filtered = searchVal 
        ? globalCountriesStat.filter(c => c.country_name.toLowerCase().includes(searchVal))
        : globalCountriesStat;

    renderWorldTableRows(filtered, currentWorldLimit);
}

/**
 * Animated Number Counter
 */
function numCounter() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target') || '0', 10);
        if (isNaN(target)) return;

        let current = 0;
        const duration = 1200; // ms
        const startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            current = Math.floor(ease * target);
            counter.innerText = numberWithCommas(current);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                counter.innerText = numberWithCommas(target);
            }
        };

        requestAnimationFrame(step);
    });
}

function numberWithCommas(x) {
    if (x === null || x === undefined) return '0';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ==========================================
// CHART LOGIC
// ==========================================

async function getDataForChart() {
    try {
        const [responseChartVn, responseChartWorld, responseChartCountries] = await Promise.all([
            fetch("https://api.apify.com/v2/key-value-stores/Tksmptn5O41eHrT4d/records/LATEST").catch(() => null),
            fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=30").catch(() => null),
            fetch("https://disease.sh/v3/covid-19/historical/USA%2CIndia%2CBrazil%2CFrance%2CRussia?lastdays=90").catch(() => null)
        ]);

        const dataVN = responseChartVn && responseChartVn.ok ? await responseChartVn.json() : { canhiem: [], catuvong: [], cakhoi: [] };
        const dataWorld = responseChartWorld && responseChartWorld.ok ? await responseChartWorld.json() : { cases: {}, deaths: {}, recovered: {} };
        const dataCountries = responseChartCountries && responseChartCountries.ok ? await responseChartCountries.json() : [];

        cachedChartData = { dataVN, dataWorld, dataCountries };
        return cachedChartData;
    } catch (err) {
        console.error("getDataForChart error:", err);
        return {
            dataVN: { canhiem: [], catuvong: [], cakhoi: [] },
            dataWorld: { cases: {}, deaths: {}, recovered: {} },
            dataCountries: []
        };
    }
}

function renderChartHelper(idChart, config) {
    const canvas = document.getElementById(idChart);
    if (!canvas) return;

    if (chartInstances[idChart]) {
        chartInstances[idChart].destroy();
    }

    chartInstances[idChart] = new Chart(canvas, config);
}

function renderAllCharts(chartData) {
    if (!chartData) return;
    const { dataVN, dataWorld, dataCountries } = chartData;

    if (dataWorld.cases) {
        createChartWorld([dataWorld.cases, dataWorld.deaths, dataWorld.recovered], 'BIỂU ĐỒ TÌNH HÌNH DỊCH BỆNH THẾ GIỚI TRONG 1 THÁNG', "global-trend");
    }
    if (dataCountries && dataCountries.length) {
        createChartCountries(dataCountries, "BIỂU ĐỒ SO SÁNH GIỮA CÁC NƯỚC", "countries-trend");
    }
    if (dataVN.canhiem && dataVN.canhiem.length) {
        createChart([dataVN.canhiem, dataVN.catuvong, dataVN.cakhoi], 'BIỂU ĐỒ TÌNH HÌNH DỊCH BỆNH VIỆT NAM TRONG 10 NGÀY QUA', "vietnam-chart");
    }
}

function createChart(dataforChart, title, idChart) {
    const labels = [];
    const canhiem = [];
    const catuvong = [];
    const cakhoi = [];
    const theme = getChartThemeColors();

    const list = dataforChart[0] || [];
    for (let i = 0; i < list.length; i++) {
        labels.push(list[i].day);
        canhiem.push(list[i].quantity || 0);
    }

    if (dataforChart[1]) {
        for (let i = 0; i < dataforChart[1].length; i++) {
            catuvong.push(dataforChart[1][i].quantity || 0);
        }
    }
    if (dataforChart[2]) {
        for (let i = 0; i < dataforChart[2].length; i++) {
            cakhoi.push(dataforChart[2][i].quantity || 0);
        }
    }

    const data = {
        labels: labels,
        datasets: [
            {
                label: "Ca nhiễm",
                data: canhiem,
                borderColor: '#0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                fill: true,
                tension: 0.35
            },
            {
                label: "Ca tử vong",
                data: catuvong,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.35
            },
            {
                label: "Ca khỏi",
                data: cakhoi,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.35
            }
        ]
    };

    const config = {
        type: 'line',
        data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                title: { display: true, text: title, font: { size: 16, weight: 'bold' }, color: theme.titleColor },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('vi-VN')}`
                    }
                }
            },
            scales: {
                y: {
                    ticks: { callback: (val) => val.toLocaleString('vi-VN'), color: theme.tickColor },
                    grid: { color: theme.gridColor }
                },
                x: {
                    ticks: { color: theme.tickColor },
                    grid: { color: theme.gridColor }
                }
            }
        }
    };

    renderChartHelper(idChart, config);
}

function createChartWorld(dataforChart, title, idChart) {
    const labels = [];
    const cases = [];
    const deaths = [];
    const recovered = [];
    const theme = getChartThemeColors();

    const casesObj = dataforChart[0] || {};
    const deathsObj = dataforChart[1] || {};
    const recObj = dataforChart[2] || {};

    for (const day in casesObj) {
        labels.push(day);
        cases.push(casesObj[day] || 0);
        deaths.push(deathsObj[day] || 0);
        recovered.push(recObj[day] || 0);
    }

    const data = {
        labels,
        datasets: [
            {
                label: "Ca nhiễm",
                data: cases,
                borderColor: '#0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                tension: 0.35
            },
            {
                label: "Ca tử vong",
                data: deaths,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.35
            },
            {
                label: "Ca khỏi",
                data: recovered,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.35
            }
        ]
    };

    const config = {
        type: 'line',
        data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                title: { display: true, text: title, font: { size: 16, weight: 'bold' }, color: theme.titleColor },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('vi-VN')}`
                    }
                }
            },
            scales: {
                y: {
                    ticks: { callback: (val) => val.toLocaleString('vi-VN'), color: theme.tickColor },
                    grid: { color: theme.gridColor }
                },
                x: {
                    ticks: { color: theme.tickColor },
                    grid: { color: theme.gridColor }
                }
            }
        }
    };

    renderChartHelper(idChart, config);
}

function createChartCountries(dataforChart, title, idChart) {
    const list = Array.isArray(dataforChart) ? dataforChart : [];
    if (list.length === 0) return;

    const firstTimeline = list[0]?.timeline?.cases || {};
    const labels = Object.keys(firstTimeline);
    const theme = getChartThemeColors();

    const countryColors = [
        { label: 'Hoa Kỳ', border: '#f59e0b', bg: '#f59e0b' },
        { label: 'Ấn Độ', border: '#3b82f6', bg: '#3b82f6' },
        { label: 'Brazil', border: '#06b6d4', bg: '#06b6d4' },
        { label: 'Pháp', border: '#ef4444', bg: '#ef4444' },
        { label: 'Nga', border: '#10b981', bg: '#10b981' }
    ];

    const datasets = list.slice(0, 5).map((item, idx) => {
        const countryName = item.country || ('Country ' + (idx + 1));
        const color = countryColors[idx] || { border: '#6366f1', bg: '#6366f1' };
        const caseVals = [];
        for (const day of labels) {
            caseVals.push(item.timeline?.cases?.[day] || 0);
        }

        return {
            label: color.label || countryName,
            data: caseVals,
            borderColor: color.border,
            backgroundColor: color.bg,
            tension: 0.35,
            fill: false
        };
    });

    const data = { labels, datasets };
    const config = {
        type: 'line',
        data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                title: { display: true, text: title, font: { size: 16, weight: 'bold' }, color: theme.titleColor },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('vi-VN')}`
                    }
                }
            },
            scales: {
                y: {
                    ticks: { callback: (val) => val.toLocaleString('vi-VN'), color: theme.tickColor },
                    grid: { color: theme.gridColor }
                },
                x: {
                    ticks: { color: theme.tickColor },
                    grid: { color: theme.gridColor }
                }
            }
        }
    };

    renderChartHelper(idChart, config);
}

// ==========================================
// INITIALIZATION & EVENT HANDLERS
// ==========================================

async function main() {
    try {
        const [vnResult, worldResult] = await Promise.all([
            getDataVN(),
            getDataWorld()
        ]);

        const vnData = vnResult.data || {};
        renderDashboardVn(
            vnData.infected || 0,
            vnData.deceased || 0,
            vnData.recovered || 0,
            vnData.treated || 0,
            (vnData.detail && vnData.detail.length) || 63
        );

        const { countries_stat, statistic_taken_at, world_total } = worldResult;
        const lastUpdatedEl = document.getElementById('last-updated');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = "Cập nhật lúc: " + statistic_taken_at;
        }

        renderDashboardWorld(
            world_total.total_cases,
            world_total.new_cases,
            world_total.total_deaths,
            world_total.new_deaths,
            world_total.total_recovered,
            world_total.fatality,
            world_total.affected_countries
        );

        numCounter();

        // Populate Tables & Map tooltips
        createTableWorld(countries_stat);
        createTable(vnData.detail || []);

        // Load Charts
        const chartData = await getDataForChart();
        renderAllCharts(chartData);
    } catch (e) {
        console.error("Main execution error:", e);
    }
}

async function start() {
    await main();

    for (const property in state_specific) {
        if (!state_specific[property].description) {
            state_specific[property].inactive = "yes";
        }
    }
    for (const property in state_specific_world) {
        if (state_specific_world[property].description === "default") {
            state_specific_world[property].inactive = "yes";
            state_specific_world[property].color = "#ffebee";
        }
    }

    if (window.simplemaps_countrymap?.refresh) simplemaps_countrymap.refresh();
    if (window.simplemaps_worldmap?.refresh) simplemaps_worldmap.refresh();
}

// Setup Event Listeners after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Theme (Default: Bright Mode)
    initTheme();

    // Start data fetch
    start();

    // Tab switch map refresh
    if (window.jQuery) {
        jQuery('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            const target = e.target.getAttribute("href");
            if (target === "#vn-container" && window.simplemaps_countrymap?.refresh) {
                simplemaps_countrymap.refresh();
            } else if (target === "#world-container" && window.simplemaps_worldmap?.refresh) {
                simplemaps_worldmap.refresh();
            }
        });
    }

    // "Xem thêm" button
    const btnMore = document.getElementById("btn-show-more-world");
    if (btnMore) {
        btnMore.addEventListener("click", showMoreCountries);
    }

    // World Table Search Filter
    const searchWorld = document.getElementById("search-world");
    if (searchWorld) {
        searchWorld.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase().trim();
            const filtered = term 
                ? globalCountriesStat.filter(c => c.country_name.toLowerCase().includes(term))
                : globalCountriesStat;
            renderWorldTableRows(filtered, term ? filtered.length : currentWorldLimit);
        });
    }

    // Vietnam Table Search Filter
    const searchVn = document.getElementById("search-vn");
    if (searchVn) {
        searchVn.addEventListener("input", (e) => {
            const term = normalizeVnName(e.target.value);
            const filtered = term 
                ? globalVnDetail.filter(item => normalizeVnName(item.name).includes(term))
                : globalVnDetail;
            renderVnTableRows(filtered);
        });
    }

    // Refresh icon with animation
    const refreshBtn = document.getElementById("refresh-btn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const icon = refreshBtn.querySelector(".refresh-icon-svg");
            if (icon) icon.classList.add("spinning");
            await start();
            setTimeout(() => {
                if (icon) icon.classList.remove("spinning");
            }, 600);
        });
    }
});
