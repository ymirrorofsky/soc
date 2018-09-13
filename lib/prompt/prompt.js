function Prompt(message, placeholder, action1, action2,y,n){
	Confirm.call(this, message, action1, action2,y,n)
    this.placeholder = placeholder
}

Prompt.prototype = Object.create(Confirm.prototype)
Prompt.prototype.constructor = Prompt

Prompt.prototype.showContent = function(box) {
    box.classList.add('modal-prompt')
    
    var div = document.createElement('div')
    div.className = 'modal-content'
    box.appendChild(div)
    
    var input = document.createElement('input')
    input.type = 'password'
    input.placeholder = this.placeholder
    div.appendChild(input)
    
    // 使文本框获得焦点
    input.focus();
}

Prompt.prototype.text = function(){
    // 只在弹出框中查找input，
    // 避免document中的其它input干扰
    var input = this.ele.querySelector('input')
    return input.value
}


