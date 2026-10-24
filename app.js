const cl = console.log;

const productform = document.getElementById('productform')
const productprice = document.getElementById('productprice')
const productname = document.getElementById('productname')
const productcategory = document.getElementById('productcategory')
const productquantity = document.getElementById('productquantity')
const addbtn = document.getElementById('addbtn')
const updatebtn = document.getElementById('updatebtn')
const productcontainer = document.getElementById('productcontainer')
const spinner = document.getElementById('spinner')


const Base_url = `https://crud-dfd04-default-rtdb.firebaseio.com/`
const Product_url = `${Base_url}products.json`

const state = {
     productArr :[],
     edit_id :null,
}

function objToArr(obj){
    for(const key in obj){
        obj[key].id = key;
        state.productArr.unshift(obj[key])
    }
}

function handleSpinner(flag){
    if(flag){
        spinner.classList.remove('d-none')
    }else{
        spinner.classList.add('d-none')
    }
}

function snackBar(msg,icon){
    Swal.fire({
        title:msg,
        timer:3000,
        icon:icon,
    })
}

//read..


async function oncreate(){
    handleSpinner(true)
    try{
        let res = await fetch(Product_url)
        if(!res.ok){
            throw new Error('error')
        }
        let data = await res.json();
        state.productArr = [];
        objToArr(data)
        templiting(state.productArr);
    }catch(err){
       snackBar(err.message,'error');
    }
    finally{
        handleSpinner()
    }
}
oncreate();

function templiting(arr){
    let result = ``
    arr.forEach((p,i)=>{
        result += `
                <tr id="${p.id}">
                    <td>${i+1}</td>
                    <td>${p.name}</td>
                    <td>${p.price}</td>
                    <td>${p.category}</td>
                    <td>${p.quantity}</td>
                    <td><button onclick="onedit(this)" class="btn btn-secondary">Edit</button></td>
                    <td><button onclick="ondelete(this)" class="btn btn-danger">Delete</button></td>
                </tr>`
    })
    productcontainer.innerHTML = result;
}


//create

async function onAddproduct(eve){
    eve.preventDefault()
    try{
        handleSpinner(true)
        let newObj = {
        name:productname.value,
        price:productprice.value,
        category:productcategory.value,
        quantity:productquantity.value
        }
    
        let res = await fetch(Product_url,{
            method:"POST",
            body:JSON.stringify(newObj),
            headers :{
                "Content-Type":"Application/json",
            }
        })
        
        if(!res.ok){
          throw new Error("Error:"+res.status)            
        }
        let data = await res.json()
        newObj.id = data.name;
        state.productArr.unshift(newObj)
        templiting(state.productArr)
        
        productform.reset();
        snackBar("Student Data Added Successfully !!",'success')
        }catch(err){
         snackBar(err.message,'error')
        }
        finally{
        handleSpinner()
    }
}


//edit

function onedit(ele){
    let edit_id = ele.closest('tr').id
    state.edit_id = edit_id
    let editObj = state.productArr.find(p => p.id === edit_id)

    productname.value = editObj.name
    productprice.value = editObj.price
    productcategory.value = editObj.category
    productquantity.value = editObj.quantity

    addbtn.classList.add('d-none')
    updatebtn.classList.remove('d-none')
}

//update


async function onupdate() {
    try {
        handleSpinner(true);
        let update_id = state.edit_id;
        let update_url = `${Base_url}products/${update_id}.json`;
        let updated_obj = {
            name:productname.value,
            price:productprice.value,
            category:productcategory.value,
            quantity:productquantity.value,
            id: update_id,
        }
        let res = await fetch(update_url, {
            method: "PATCH",
            body: JSON.stringify(updated_obj),
            headers: {
                "content-Type": "Application/json",
            }
        })
        if (!res.ok) {
            throw new Error("Update failed: " + res.status);
        }
        let data = await res.json();
        let getIndex = state.productArr.findIndex(t => t.id === update_id);
        state.productArr[getIndex] = updated_obj;
       templiting(state.productArr)
        productform.reset();
        state.edit_id = null;
        snackBar("Data updated successfully", 'success');

        updatebtn.classList.add('d-none');
        addbtn.classList.remove('d-none');

    }
    catch (err) {
        snackBar(err.message, 'error');
    }
    finally {
        handleSpinner();
    }

}

//delete


async function ondelete(ele){
    let remove_Id = ele.closest('tr').id
    let remove_url = `${Base_url}products/${remove_Id}.json`;
 
  let getconfirm = await Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Yes, delete it!"
})
if(getconfirm.isConfirmed){
    try{
        handleSpinner(true)
        let res = await fetch(remove_url,{
            method : "DELETE",
        })
        if(!res.ok){
            throw new  Error("Error" + res.status)
        }
        let getIndex = state.productArr.findIndex(t => t.id === remove_Id);
        state.productArr.splice(getIndex,1)
        ele.closest('tr').remove()

         let td = [...document.querySelectorAll("#productcontainer tr td:first-child")];
                       td.forEach((td,i)=>{
                        td.innerHTML = i+1
                       })
                       
        snackBar("Data Deleted successfully!",'success')
    }catch (err){
       snackBar(err.message,'error')
    }
    finally{
        handleSpinner()
    }
}
}


updatebtn.addEventListener("click",onupdate)
productform.addEventListener("submit",onAddproduct)