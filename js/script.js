var Mediator = {
    events: [],
    on: function (eventName, callback) {
        this.events[eventName] = this.events[eventName] || []
        this.events[eventName].push(callback)
    },
    emit: function (eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (callback) {
                callback(data)
            })
        }
    }
};



/*** CAROUSEL COMPONENT ***/
(async function () {
    const template = $("#swiper_template").html()
    const $slider = $("#swiperWrapper")
    const data = await fetch_data();
    const loader_template = `<span class="loader_back"><i class="fas fa-sync fa-spin"></i>
    </span>`
    $slider.html(Mustache.render(loader_template))
    function render() {
        $slider.html(Mustache.render(template, {country: data}))
        $slider.delegate(".slide", "click", slideClick)
    }

    async function fetch_data(){
        try{
            const res = await axios.get("https://restcountries.com/v2/all")
            return res.data  
        }catch(error){
            console.log("error")
        }
    }

    function slideClick(e){
        if(e.target != this)
            e.target = this

        //filter out the country in the clicked slide
        const slide = data.filter(slide => slide.name == e.target.id)
        Mediator.emit("changeDisplay", {"slide": slide})
    }
    function init(){
        //the render function in the display component receives the slide object within an array
        const slide = []
        slide.push(data[0])
        Mediator.emit("changeDisplay", {"slide": slide})
    }

    init();
    render();
    
})();



/*** MAIN DISPLAY COMPONENT ***/
(function(){
    Mediator.on("changeDisplay", render)
   
    const $display = $("#display")
    const template = $("#display_template").html()

    function render(data){
        $display.html(Mustache.render(template, {"slide": data.slide[0]}))
    }
    
})();



/*** NEWS COMPONENT ***/
(function(){

    Mediator.on("changeDisplay", render)

    const API_KEY = "f4598fb86db74cbabd5c5785a158a62b"
    const template = $("#news_template").html()
    const $news = $("#news")

    async function render(data){
        const code = data.slide[0].alpha2Code
        const news = await fetch_news(code);
        var found = news.articles.length > 0  ? true: false
        console.log(found)
        $news.html(Mustache.render(template, {"articles":news.articles, "found":found, "empty": !found}))
    }
    
    async function fetch_news(code){
        try{    
            const res = await axios.get("https://newsapi.org/v2/top-headlines?country="+code+"&apiKey="+API_KEY)
            return res.data
        } catch(error){
            console.log(error)
        }
    }

})();