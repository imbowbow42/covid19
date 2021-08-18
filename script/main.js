async function getDataVN() {
    const responseData = await fetch("https://api.apify.com/v2/key-value-stores/ZsOpZgeg7dFS1rgfM/records/LATEST");
    const responseHcKey = await fetch("https://api.apify.com/v2/key-value-stores/p3nS2Q9TUn6kUOriJ/records/LATEST");
    const data = await responseData.json();
    const hcKey = await responseHcKey.json();
    return { data, hcKey };
}
async function getDataWorld() {
    const responseData = await fetch("https://corona-virus-world-and-india-data.p.rapidapi.com/api", {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": "05768fef14mshcf7e044eabfc816p11a125jsn24fb663c88b7",
            "x-rapidapi-host": "corona-virus-world-and-india-data.p.rapidapi.com"
        }
    })
    const data = await responseData.json();

    return data;
}
var listCountriesMapped = []
async function main() {
    var { infected, treated, recovered, deceased, detail } = await (await getDataVN()).data;
    renderDashboardVn(infected, deceased, recovered, treated,detail.length);
    const { countries_stat, statistic_taken_at, world_total } = await (await getDataWorld());
    $('#last-updated')[0].textContent = "Last update: " + statistic_taken_at;
    const { total_cases, new_cases, total_recovered, total_deaths, new_deaths } = world_total;
    renderDashboardWorld(
        total_cases,
        new_cases,
        total_deaths,
        new_deaths,
        total_recovered,
        "2,17%"
    );
    
    numCounter()
        // TABLE
    listCountriesMapped = createWorlList(countries_stat)
    const { key } = await (await getDataVN()).hcKey;
    createTableWorld(countries_stat) // Create table the gioi
    createTable(detail, key); // Create table viet nam
    
        //CHART

    var { cases, deaths, recovered } = await (await getDataForChart()).dataWorld;
    const { canhiem, catuvong, cakhoi } = await (await getDataForChart()).dataVN;
    var countriesComparisonDataChart = await (await (await getDataForChart()).dataCountries)
    createChartWorld([cases, deaths, recovered], 'BIỂU ĐỒ TÌNH HÌNH DỊCH BỆNH THẾ GIỚI TRONG 1 THÁNG', "global-trend")
    createChart([canhiem, catuvong, cakhoi], 'BIỂU ĐỒ TÌNH HÌNH DỊCH BỆNH VIỆT NAM TRONG 10 NGÀY QUA', "vietnam-chart");
    createChartCountries(countriesComparisonDataChart, "BIỂU ĐỒ SO SÁNH GIỮA CÁC NƯỚC", "countries-trend")
}


function renderDashboardWorld(confirmed, new_cases, death, new_deaths, released, fatality) {
    $(".confirmed.number")[0].dataset.target = removeComma(confirmed)
    $(".confirmed.diff")[0].textContent = "(+" + new_cases + ")";
    $(".death.number")[0].dataset.target = removeComma(death);
    $(".death.diff")[0].textContent = "(+" + new_deaths + ")";
    $(".released.number")[0].dataset.target = removeComma(released);
    $(".fatality.number")[0].textContent = fatality;
    $(".country.number")[0].dataset.target = '222';

}

function renderDashboardVn(confirmed, death, released, fatality, provinces) {
    $(".confirmed.number")[1].dataset.target = confirmed
    $(".death.number")[1].dataset.target = death;
    $(".released.number")[1].dataset.target = released;
    $(".fatality.number")[1].dataset.target = fatality;
    $(".provinces.number")[0].dataset.target = provinces;
}
function removeComma(num) {
    return num.replaceAll(',', '')
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
        name: "Đông Bắc"
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
        name: "Dak Lak"
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
        name: "Quàng Nam"
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
        name: "Bà Rịa Vũng Tàu"
    },
    VNM496: {
        name: "Bình Thuận"
    },
    VNM497: {
        name: "Đông Nam Bộ"
    },
    VNM498: {
        name: "An Giang"
    },
    VNM499: {
        name: "Can Tho"
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
function createTable(detail, key) {
    for (var i = 0; i < detail.length; i++) {
        var tr = document.createElement("tr");

        var name = key.find(k => k["hec-key"] == detail[i]["hc-key"]);
        if (name) {
            var tdName = document.createElement("td");
            tdName.textContent = exeString(name.name);

            for (const property in state_specific) {
                if (removeAccents(state_specific[property].name).toLowerCase() == removeAccents(exeString(name.name)).toLowerCase()) {
                    state_specific[property].color = setColorMap(parseInt(detail[i].value), colors);
                    state_specific[property].description = `
                    <span>Số ca nhiễm: <badge>${detail[i].value}</badge></span><br>
                    <span>Số ca khỏi: <badge>${detail[i].socakhoi}</badge></span><br>
                    <span>Số ca tử vong: <badge>${detail[i].socatuvong}</badge></span>
                    `;
                }
            }
            var tdRank = document.createElement("td");
            tdRank.textContent = i + 1;
            var tdNhiem = document.createElement("td");
            tdNhiem.textContent = detail[i].value;

            var tdKhoi = document.createElement("td");
            tdKhoi.textContent = detail[i].socakhoi;

            var tdTuVong = document.createElement("td");
            tdTuVong.textContent = detail[i].socatuvong;

            tr.appendChild(tdRank);
            tr.appendChild(tdName);
            tr.appendChild(tdNhiem);
            tr.appendChild(tdKhoi);
            tr.appendChild(tdTuVong);
            document.getElementById("table-vn").appendChild(tr)
        }
    }
}
function createWorlList(data) {
    return data.map((country, index) => {

        return `
        <tr>
            <th scope="row">${index + 1}</th>
            <td>${country['country_name']}</td>
            <td>${country['cases']} <br> <span class="text-danger diff">(+${country['new_cases']})</span></td>
            <td>${country['deaths']} <br> <span class="text-danger diff">(+${country['new_deaths']})</span></td>
            <td>${country['total_recovered']}</td>
        </tr>
    `
    })
}

function createTableWorld(data) {
    $("#table-world")[0].tBodies[0].innerHTML = listCountriesMapped.slice(0, 70).join('')
    for (const property in state_specific_world) {
        for (const country in data) {
            if (state_specific_world[property].name == data[country]['country_name']) {
                state_specific_world[property].color = setColoMapWorld(parseInt(removeComma(data[country]['cases'])), colors);
                state_specific_world[property].description = `
                    <span>Số ca nhiễm: <badge>${data[country]['cases']}</badge></span><br>
                    <span>Số ca khỏi: <badge>${data[country]['total_recovered']}</badge></span><br>
                    <span>Số ca tử vong: <badge>${data[country]['deaths']}</badge></span>
                    `;
            }
        }
    }

}
function showMoreCountries() {
    let tBody = document.getElementById('table-world').tBodies[0]
    if (tBody.rows.length < 100) {
        for (i = 70; i < 150; i++) {
            let newRow = document.createElement('tr')
            newRow.innerHTML = listCountriesMapped[i]
            tBody.appendChild(newRow)
            document.getElementsByClassName('btn')[0].innerHTML = "Xem thêm (150/222)"
        }

    }
    else {
        for (i = 150; i < listCountriesMapped.length; i++) {
            let newRow = document.createElement('tr')
            newRow.innerHTML = listCountriesMapped[i]
            tBody.appendChild(newRow)
            document.getElementsByClassName('btn')[0].style.display = 'none'
        }
    }
}
var colors = [
    "#ffebee",
    "#ffcdd2",
    "#ef9a9a",
    "#e57373",
    "#ef5350",
    "#f44336",
    "#e53935",
    "#b71c1c"
]

function setColorMap(value) {
    if (value >= 1 && value <= 5) {
        return colors[1];
    } else if (value > 5 && value <= 10) {
        return colors[2];
    } else if (value > 10 && value <= 20) {
        return colors[3]
    } else if (value > 20 && value <= 50) {
        return colors[4]
    } else if (value > 50) {
        return colors[5]
    } else {
        return colors[0]
    }
}
function setColoMapWorld(value) {

    if (value >= 10000 && value <= 100000)
        return colors[1]
    else if (value >= 100000 && value <= 500000) {
        return colors[2];
    } else if (value > 500000 && value <= 1000000) {
        return colors[3];
    } else if (value > 1000000 && value <= 5000000) {
        return colors[4]
    } else if (value > 5000000 && value <= 10000000) {
        return colors[5]
    } else if (value > 10000000) {
        return colors[6]
    } else {
        return colors[0]
    }
}

function exeString(text) {
    var textChange = "";
    text.split("-").forEach(t => {
        textChange += capitalizeFirstLetter(t);
        textChange += " ";
    })
    return textChange.trim()
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function removeAccents(str) {
    var AccentsMap = [
        "aàảãáạăằẳẵắặâầẩẫấậ",
        "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
        "dđ", "DĐ",
        "eèẻẽéẹêềểễếệ",
        "EÈẺẼÉẸÊỀỂỄẾỆ",
        "iìỉĩíị",
        "IÌỈĨÍỊ",
        "oòỏõóọôồổỗốộơờởỡớợ",
        "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
        "uùủũúụưừửữứự",
        "UÙỦŨÚỤƯỪỬỮỨỰ",
        "yỳỷỹýỵ",
        "YỲỶỸÝỴ"
    ];
    for (var i = 0; i < AccentsMap.length; i++) {
        var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
        var char = AccentsMap[i][0];
        str = str.replace(re, char);
    }
    return str;
}
function numCounter() {
    const counters = document.querySelectorAll('.counter');
    const speed = 150; // The lower the slower
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;

            // Lower inc to slow and higher to slow
            const inc = target / speed;

            if (count < target) {

                counter.innerText = Math.ceil(count + inc);

                setTimeout(updateCount, 1);
            } else {
                counter.innerText = numberWithCommas(target);
            }
        };

        updateCount();
    });
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
async function start() {
    await main();
    for (const property in state_specific) {
        if (state_specific[property].description) {
        } else {
            state_specific[property].inactive = "yes";
        }
    }
    for (const property in state_specific_world) {
        if (state_specific_world[property].description == "default") {
            state_specific_world[property].inactive = "yes";
            state_specific_world[property].color = "#ffebee"
        }
    }
    simplemaps_countrymap.refresh()
    simplemaps_worldmap.refresh()

}

start()

//  CHART
async function getDataForChart() {
    const responseChartVn = await fetch("https://api.apify.com/v2/key-value-stores/Tksmptn5O41eHrT4d/records/LATEST");
    const responseChartWorld = await fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=30")
    const responseChartCountries = await fetch("https://disease.sh/v3/covid-19/historical/USA%2CIndia%2CBrazil%2CFrance%2CRussia?lastdays=90")

    const dataVN = await responseChartVn.json();
    const dataWorld = await responseChartWorld.json();
    const dataCountries = await responseChartCountries.json();
    return { dataVN, dataWorld, dataCountries }
}
function createChart(dataforChart, title, idChart) {
    const labels = [];

    for (let i = 0; i < dataforChart[0].length; i++) {
        labels.push(dataforChart[0][i].day);
    }

    var data = {
        labels: labels,
        datasets: [
            {
                label: "Ca nhiễm",
                data: dataforChart[0].map(x => x.quantity),
                borderColor: '#5bc0de',
                backgroundColor: '#5bc0de',
                tension: 0.3,

            },
            {
                label: "Ca tử vong",
                data: dataforChart[1].map(x => x.quantity),
                borderColor: '#d9534f',
                backgroundColor: '#d9534f',
                tension: 0.3,

            },
            {
                label: "Ca khỏi",
                data: dataforChart[2].map(x => x.quantity),
                borderColor: '#5cb85c',
                backgroundColor: '#5cb85c',
                tension: 0.3,

            }
        ]
    };

    const config = {
        type: 'line',
        data,
        options: {
            interaction: {
                mode: 'index',
                axis: 'y'
            },
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 20,
                        weight: 'bolder'
                    }
                }
            }

        }
    };

    var myChart = new Chart(
        document.getElementById(idChart),
        config
    );
}
function createChartWorld(dataforChart, title, idChart) {
    const labels = [];
    const cases = []
    const deaths = []
    const recorverd = []
    for (day in dataforChart[1]) {
        labels.push(day);
        deaths.push(dataforChart[1][day])
    }
    for (day in dataforChart[0]) {

        cases.push(dataforChart[0][day])
    }
    for (day in dataforChart[2]) {

        recorverd.push(dataforChart[2][day])
    }

    var data = {
        labels: labels,
        datasets: [
            {
                label: "Ca nhiễm",
                data: cases,
                borderColor: '#5bc0de',
                backgroundColor: '#5bc0de',
                tension: 0.3,

            },
            {
                label: "Ca tử vong",
                data: deaths,
                borderColor: '#d9534f',
                backgroundColor: '#d9534f',
                tension: 0.3,

            },
            {
                label: "Ca khỏi",
                data: recorverd,
                borderColor: '#5cb85c',
                backgroundColor: '#5cb85c',
                tension: 0.3,

            }
        ]
    };

    const config = {
        type: 'line',
        data,
        options: {
            interaction: {
                mode: 'index',
                axis: 'y'
            },
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 20,
                        weight: 'bolder'
                    }
                }
            }

        }
    };

    var myChart = new Chart(
        document.getElementById(idChart),
        config
    );
}
function createChartCountries(dataforChart, title, idChart) {
    const labels = [];
    const USA = []
    const India = []
    const Russia = []
    const France = []
    const Brazil = []

    for (day in dataforChart[0]['timeline']['cases']) {
        labels.push(day);
        USA.push(dataforChart[0]['timeline']['cases'][day])
        
    }
    for (day in dataforChart[1]['timeline']['cases']) {
        
        India.push(dataforChart[1]['timeline']['cases'][day])
    }
    for (day in dataforChart[2]['timeline']['cases']) {
        
        Brazil.push(dataforChart[2]['timeline']['cases'][day])
    }
    for (day in dataforChart[3]['timeline']['cases']) {
        
        France.push(dataforChart[3]['timeline']['cases'][day])
    }
    for (day in dataforChart[4]['timeline']['cases']) {
        
        Russia.push(dataforChart[4]['timeline']['cases'][day])
    }
    var data = {
        labels: labels,
        datasets: [
            {
                label: "USA",
                data: USA,
                borderColor: '#f0ad4e',
                backgroundColor: '#f0ad4e',
                tension: 0.3,

            },
            {
                label: "Ấn Độ",
                data: India,
                borderColor: '#0275d8',
                backgroundColor: '#0275d8',
                tension: 0.3,

            },
            {
                label: "Brazil",
                data: Brazil,
                borderColor: '#5bc0de',
                backgroundColor: '#5bc0de',
                tension: 0.3,

            },
            {
                label: "Pháp",
                data: France,
                borderColor: '#d9534f',
                backgroundColor: '#d9534f',
                tension: 0.3,

            },
            {
                label: "Nga",
                data: Russia,
                borderColor: '#5cb85c',
                backgroundColor: '#5cb85c',
                tension: 0.3,

            }
        ]
    };

    const config = {
        type: 'line',
        data,
        options: {
            interaction: {
                mode: 'index',
                axis: 'y'
            },
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 20,
                        weight: 'bolder'
                    }
                }
            }

        }
    };

    var myChart = new Chart(
        document.getElementById(idChart),
        config
    );
}



