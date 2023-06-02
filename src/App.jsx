import { useEffect, useRef, useState } from "react";
import { complete } from "./openai";
import { InstagramLogoIcon } from "@radix-ui/react-icons";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, requestsCollection } from "./firebase";
import { addDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";

const App = () => {

  const ref = useRef(null);
  const [currentMessage, setMessage] = useState("");
  const [value, setValue] = useState("")
  const [user, setUser] = useState(null)
  const [logged, setLogged] = useState(false)
  const [currentAttempts, setAttempts] = useState(0)
  const [cafecitoPopUp, setCafecitoPopUp] = useState(false)

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user)
        setLogged(true)
        
        const filterByEmail = query(requestsCollection, where("user", "==", user.email))
        const attemptsRequest = getDocs(filterByEmail)
        attemptsRequest
        .then((querySnapshot) => {
          setAttempts(querySnapshot.size)
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
      } else {
        setUser(null)
        setLogged(false)
      }
    })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!logged) {
      handlePopUp()
      return
    }

    if(currentAttempts >= 5){
      handleCafecitoPopUp()
      return 
    }
    const message = ref.current.value;
    setMessage("")
    complete(message, data => {
      try {
        const res = data.choices[0].delta.content
        setMessage((prevState, next) => {
          return prevState + res
        })
      }catch(err){
        console.log(err)
      }
    })
    .then(()=>{
      addDoc(requestsCollection,{
        message,
        response: currentMessage,
        user: user.email,
        date : serverTimestamp(),
        cafecito : false
      })
      .then(()=>{
        console.log("Document successfully written!");
        setAttempts(prevState => prevState + 1)
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      })
    })
  }

  let handleTimeout = null;

  const handleChange = e => {
    const value = e.target.value;

    if (handleTimeout) {
      clearTimeout(handleTimeout);
    }

    handleTimeout = setTimeout(() => {
      setValue(value);
    }, 300);
  }

  const handleClick = e => {
    let message = e.target.innerText;
    message = message.split("🖐")[0];
    ref.current.value = message;
    setValue(message);
  }

  const handlePopUp = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
  }

  const handleLogout = () => {
    signOut(auth)
  }

  const handleCafecitoPopUp = () => {
    setCafecitoPopUp(true)
  }

  return (
    <>
      <header className="flex justify-center flex-col">
        <h1 className="text-4xl font-bold text-center mt-4">CarayanIA</h1>
        {!logged && <button onClick={handlePopUp}>login</button>}
        {/* circular avatar with user.photoURL */}
        {logged && <div className="flex justify-center gap-4"><p className="text-center">{user.email} - Attempts made : {currentAttempts} </p><button onClick={handleLogout}>logout</button></div>}

      </header>
      <form onSubmit={handleSubmit} className="m-auto  px-4 sm:px-5 md:px-6 w-full md:max-w-[500px] lg:max-w-[700px] transition">
        <div className="flex flex-col">
          <label htmlFor="message" className="w-full">
            <textarea ref={ref} onChange={handleChange} id="message" className="resize-none h-20 w-full" />
          </label>
          <button className="border rounded p-2 w-fit mx-auto mt-4 disabled:border-gray-500 disabled:text-gray-500 transition" disabled={value.length > 0 ? false : true}>Change</button>
        </div>
      </form>
      <section className="w-full md:max-w-[750px] lg:max-w-[900px] mx-auto">
        <div className="">
          <h2 className="text-2xl text-center">Ejemplos posibles : </h2>
          <ul className="list-none px-4 my-4">
            <li onClick={handleClick} className="group cursor-pointer item text-[#ffffff63] hover:text-white p-2 rounded mb-2">Cual es el significado de la vida?<span className="hidden group-hover:inline-block ml-2">🖐 <span className="text-xs relative right-1">copy!</span></span></li>
            <li onClick={handleClick} className="group cursor-pointer item text-[#ffffff63] hover:text-white p-2 rounded mb-2">Que me podria poner para el cumpleaños de mi primito de 15?<span className="hidden group-hover:inline-block ml-2">🖐 <span className="text-xs relative right-1">copy!</span></span></li>
            <li onClick={handleClick} className="group cursor-pointer item text-[#ffffff63] hover:text-white p-2 rounded mb-2">Nancy Pazos tiene un vestido rojo y zapatillas. Me podrias decir esa descripcion pero con tu estilo?<span className="hidden group-hover:inline-block ml-2">🖐 <span className="text-xs relative right-1">copy!</span></span></li>
            <li onClick={handleClick} className="group cursor-pointer item text-[#ffffff63] hover:text-white p-2 rounded mb-2">Tengo una bolsita, la tomamos? <span className="hidden group-hover:inline-block ml-2">🖐 <span className="text-xs relative right-1">copy!</span></span></li>
          </ul>
        </div>
      </section>
      <div className="m-auto  px-2 sm:px-3 md:px-4 w-full md:max-w-[500px] lg:max-w-[700px] transition">
        <h2 className={`text-2xl text-center ${currentMessage.length > 0 ? "text-white" : "text-gray-500"}`}>Respuesta</h2>
        <p>{currentMessage}</p>
      </div>
      <footer className="p-4 text-xs font-mono font-thin">
        <p className="text-center mb-2">Esta app esta hecha con ♥ y GPT-4 (lo cual no es gratis) asi que si te gusto, <span className="uppercase font-bold">pagara prata</span>  </p>
        <nav className="flex justify-center items-center gap-2">
          <a href='https://cafecito.app/horagutierrez' rel='noopener' target='_blank'><img srcSet='https://cdn.cafecito.app/imgs/buttons/button_1.png 1x, https://cdn.cafecito.app/imgs/buttons/button_1_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_1_3.75x.png 3.75x' src='https://cdn.cafecito.app/imgs/buttons/button_1.png' alt='Invitame un café en cafecito.app' className="" /></a>
          <a href="https://instagram.com/horagutierrez" target="_blank">
            <InstagramLogoIcon height={40} width={40} />
          </a>
        </nav>
      </footer>
      {cafecitoPopUp && (
        <div className="fixed top-0 left-0 w-full px-10 h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded text-gray-700">
            <h2 className="text-center font-bold text-xl mb-10">Un Cafecito porfa</h2>
            <p className="text-center mb-10">No olvides que esta app esta hecha con GPT-4 y eso no es gratis, al contrario, se paga en el sudor de esta Barbie Guerrera, asi que si te gusto, pagara prata</p>
            <div className="flex justify-center items-center gap-2 mt-4">
              <a href='https://cafecito.app/horagutierrez' rel='noopener' target='_blank'><img srcSet='https://cdn.cafecito.app/imgs/buttons/button_1.png 1x, https://cdn.cafecito.app/imgs/buttons/button_1_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_1_3.75x.png 3.75x' src='https://cdn.cafecito.app/imgs/buttons/button_1.png' alt='Invitame un café en cafecito.app' className="" /></a>
              <button onClick={() => setCafecitoPopUp(false)}>No, gracias</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;