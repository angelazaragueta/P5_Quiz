const fs= require("fs");

//Nombre del fichero donde se guardan las preguntas
const DB_FILENAME ="quizzes.json";


//Modelo de datos
// En esta variable tenemos todos los quizzes exiatentes
let quizzes =[
	{
		question: "¿Quién fue Melkor?",
		answer: "El señor de Sauron"
	},
	{
		question: "¿Quién llevó a Frodo en caballo hasta Rivendel tras ser herido con la hoja de Morgul?",
		answer: "Glorfindel"
	},
	{
		question: "¿Dónde murió Saruman?",
		answer: "En la comarca"
	},
	{
		question: "¿Cómo se llama la espada de Aragorn?",
		answer: "Andúril"
	},
	{
		question: "¿Cuántos elfos hubo en la batalla del Abismo de Helm?",
		answer: "Ninguno"
	},
	{
		question:"¿Cuántos son los espectros del Anillo o Nazgûl?",
		answer:"9"
	},
	{
		question:"¿Cuál es la palabra secreta que abre las puertas de Moria?",
		answer:"Mellon"
	}
];


const load = () => {
	fs.readFile(DB_FILENAME, (err, data) => {
		if(err) {
			//la primera vez no existe el fichero
			if(err.code === "ENOENT"){
				save();//valores iniciales
				return;
			}
			throw err;
		}
		let json =JSON.parse(data);
		if(json){
			quizzes =json;
		}
	});
};

const save = () => {
	fs.writeFile(DB_FILENAME, 
		JSON.stringify(quizzes),
		err => {
			if(err) throw err;
		});
};

// Devuelve el numero total de preguntas existentes
exports.count=()=> quizzes.length;
/**Añade un nuevo quiz
*/
exports.add=(question,answer)=> {

	quizzes.push({
		question: (question || "").trim(),
		answer:(answer || "").trim()  
	});
	save();
};

/**Para actualizar un quiz
*/
exports.update=(id, question, answer) => {
	const quiz = quizzes[id];
	if (typeof quiz === "undefined"){
		throw new Error(`El valor del parametro id no es valido`);
	}
	quizzes.splice(id, 1,{
		question: (question || "").trim(),
		answer:(answer || "").trim()
	});
	save();
};

/**Devuelve todos los quizzes existentes
*/
exports.getAll= ()=> JSON.parse(JSON.stringify(quizzes));

/** Devuelve un clon del quiz almacenado en la posicion dada*/
exports.getByIndex =id =>{
	const quiz = quizzes[id];
	if (typeof quiz=== "undefined"){
		throw new Error(`El valor del parametro id no es valido`);
	}
	return JSON.parse(JSON.stringify(quiz));
};

/** Elimina el quiz situado en la posicion dada*/

exports.deleteByIndex =id =>{
	const quiz = quizzes[id];
	if (typeof quiz=== "undefined"){
		throw new Error(`El valor del parametro id no es valido`);
	}
	quizzes.splice(id, 1);
	save();
};

//carga los quizzes almacenados en el fichero
load();