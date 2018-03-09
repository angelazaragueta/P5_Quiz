const Sequelize =require('sequelize');
const sequelize=new Sequelize("sqlite:quizzes.sqlite",{logging:false});

sequelize.define('quiz',{
	question: {
		type:Sequelize.STRING,
		unique:{msg:"Ya existe esta pregunta"},
		validate:{notEmpty:{msg:"La pregunta esta vacía"}}
	},
	answer:{
		type:Sequelize.STRING,
		validate:{ notEmpty:{msg:"La respuesta no puede estar vacía"}}
	}
});

sequelize.sync()
	.then(()=>sequelize.models.quiz.count())
	.then(count=>{
		if(!count){
			return sequelize.models.quiz.bulkCreate([
				{question: "¿Quién fue Melkor?",
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
		answer:"Mellon"}
				]);
			}
		
	})
	.catch(error=>{
		console.log(error);
	});
	module.exports=sequelize;