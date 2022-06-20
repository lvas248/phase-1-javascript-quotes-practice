document.addEventListener('DOMContentLoaded',(event)=>{
    let quoteList = document.querySelector('#quote-list')
    let form = document.querySelector('form')
    event.preventDefault
  

// Populate page with quotes
    function getQuotes(){
    return  fetch('http://localhost:3000/quotes?').then(res=>res.json())
    }

    getQuotes()
    .then(data=>{
        data.forEach(quoteObj=>{
            renderQuote(quoteObj)
         })
        })

    function renderQuote(quoteObj){
        fetch(`http://localhost:3000/likes?quoteId=${quoteObj.id}`)
        .then(res=> res.json())
        .then(data => {
            quoteList.innerHTML += `<li class='quote-card' id='${quoteObj.id}'>
            <blockquote class="blockquote">
            <p class="mb-0">${quoteObj.quote}</p>
            <footer class="blockquote-footer">${quoteObj.author}</footer>
            <br>
            <button class='btn-success'>Likes: <span>${data.length}</span></button>
            <button class='btn-danger'>Delete</button>
            <button class='btn-edit'>Edit</button>
            <form class="editField">
                <input type="text">
                <input type="text">
                <button>Submit</button>
            </form>
            </blockquote>
        </li>`
        })
        
    }

//Submitting the form creates a new quote and adds it to the list of quotes without having to refresh the page. Pessimistic rendering is recommended.
    let authorInput = document.querySelector('#author')
    let quoteInput = document.querySelector('#new-quote')

    function submitHandler(e){
        e.preventDefault()
        
        fetch('http://localhost:3000/quotes?',{
            method: 'POST',
            headers: {
                "Content-type":"application/json",
                Accept:"application/json"
            },
            body: JSON.stringify({
                "quote": quoteInput.value,
                "author": authorInput.value
            })
        })
        .then(res=> res.json())
        .then(data=>{
            renderQuote(data)
        })
        form.reset()
    }

    form.addEventListener('submit', submitHandler)

//Clicking the delete button should delete the respective quote from the API and remove it from the page without having to refresh.

function handleBtnClick(e){
    let targetQuote = e.target.parentNode.querySelector('p')
    if(e.target.textContent === "Delete"){
        getQuotes()
        .then(data=>{
            data.forEach(quoteObj=>{
                if(quoteObj.quote === targetQuote.innerText){
                    fetch(`http://localhost:3000/quotes/${quoteObj.id}`,{
                        method: 'DELETE'
                    })
                }
            })
        })
        e.target.parentNode.parentNode.remove()
    }
    else if(e.target.className === "btn-success"){
        console.log("success")
        getQuotes()
        .then(data => {
            data.forEach(quoteObj=>{
                if(quoteObj.quote === targetQuote.innerText){
                    console.log(quoteObj.id)
                    fetch('http://localhost:3000/likes',{
                        method: 'POST',
                        headers: {
                                "Content-type":"application/json",
                                Accept:"application/json"
                            },
                        body: JSON.stringify({
                            "quoteId": quoteObj.id
                         })
                     })
                  let btnText = e.target.parentNode.querySelector('.btn-success')
                  let splitText = btnText.textContent.split(' ')
                  let updatedLikeCount = parseInt(splitText[1]) + 1
                  console.log(updatedLikeCount)
                  btnText.innerText = splitText[0] + ' ' + updatedLikeCount
                }
            })
        })
    }else if(e.target.className === 'btn-edit'){
        let form = e.target.parentNode.querySelector('form')
        form.style.display = "block"
        let quoteText = form.querySelectorAll('input')[0]
        quoteText.value = targetQuote.textContent
        let authorText = form.querySelectorAll('input')[1]
        authorText.value = e.target.parentNode.querySelector('footer').textContent
        let quoteId = e.target.parentNode.parentNode.id
        form.addEventListener('submit',(e)=>{
            fetch(`http://localhost:3000/quotes/${quoteId}`,{
                method: 'PATCH',
                headers: {
                    "Content-type":"application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    "quote": `${quoteText.value}`,
                    "author": `${authorText.value}`
                })
            })
           form.reset()
        })
    }
}        
    

quoteList.addEventListener('click', handleBtnClick)


// create a sort button that can be toggled on or off.  When off sort = by id, when on sort = Alphabetically by author

let sortBtn = document.createElement('button')
sortBtn.textContent = "Sort: ON"
sortBtn.id = 'sort'
let div = document.querySelector('div')
let body = document.querySelector('.container')
body.insertBefore(sortBtn, div)

document.querySelector('#sort').addEventListener('click', (e)=>{
    let btnText = e.target.textContent
    quoteList.innerHTML = ""
    if(btnText === "Sort: ON"){
        //create toggle text change
        let splitText = btnText.split(" ")
        splitText[1] = 'OFF'
        let updatedText = splitText[0] + ' ' + splitText[1]
        e.target.textContent = updatedText

        //populate sorted data-------------------
        // getQuotes()
        // .then(data => {
        //     let authorArray =[]
        //     data.forEach((quoteObj)=>{
        //         authorArray.push(quoteObj.author)
        //     })
        //     //console.log(authorArray)
        //     authorArray.sort()
        //     console.log(authorArray)
        //     authorArray.forEach(author =>{
        //         data.forEach(quoteObj =>{
        //             if(author === quoteObj.author){
        //                 renderQuote(quoteObj)
        //             }
        //         })
        //     })
        // })

        //alternative way to sorting
        fetch('http://localhost:3000/quotes?_sort=author')
        .then(res=>res.json())
        .then(data => {
            data.forEach(quoteObj =>{
                renderQuote(quoteObj)
            })
        })

    }
    else{
        getQuotes()
        .then(data=> {
            data.forEach(quoteObj=>{
                renderQuote(quoteObj)
            })
        })
    }
    
   
    
})
})




