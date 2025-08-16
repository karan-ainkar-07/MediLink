const user ={
    name:"abc",
    fn:function f(){
        console.log(this);
    },
    fn2:()=>{
        console.log(this.name);
    }
}
user.fn();
user.fn2();