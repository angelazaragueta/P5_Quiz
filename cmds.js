const {log,biglog, errorlog, colorize}=require("./out");

const {models}=require ('./model'); 
const Sequelize=require('sequelize');

/**
* Muestra la ayuda
*/
exports.helpCmd = rl => {
	log('Comandos:');
	log("  h|help - Muestra esta ayuda.");
    log("  list - Listar los quizzes existentes");
    log("  show <id> - Muestra la pregunta y la respuesta del quiz indicado");
    log("  add - Añadir nuevo Quiz interactivamente. ");
    log("  delete <id> - Borrar el quiz indicado.");
	log("  edit <id> - Editar el quiz indicado");
	log("  test <id> - Probar el quiz indicado");
	log("  p|play - Jugar a una pregunta aleatoriamente todos los quizzes");
	log("  credits - Creditos");
	log("  q|quit - Salir del programa.");
	rl.prompt();
};
/**
* Salimos del programa
*/
exports.quitCmd = rl =>{
	rl.close();

};

const makeQuestion=(rl,text)=>{
	return new Sequelize.Promise((resolve,reject)=>{
		rl.question(colorize(text,'red'),answer=>{
			resolve(answer.trim())
		});
	});
};
/**
* Añadimos un nuevo quiz
*/
exports.addCmd = rl => {
	makeQuestion(rl,'Introduzca una pregunta:')
	.then(q=>{
		return makeQuestion(rl,'Introduzca la respuesta: ')
		.then(a=>{
			return {question:q,answer:a};
		});
	})
	.then(quiz=>{
		return models.quiz.create(quiz);
	})
	.then((quiz)=>{
		log(`${colorize(quiz.id,'magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);

	})
	.catch(Sequelize.ValidationError,error=>{
		errorlog('El quiz es erroneo:');
		error.errors.forEach(({message})=>errorlog(message));
	})
	.catch(error=>{
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});
};

/**
* Listamos todos los quizzes existentes
*/
exports.listCmd = rl =>{
	
	models.quiz.findAll()
	.each(quiz=>{
			log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
			})
	
.catch(error=>{
	errorlog(error.message);
})
.then(()=>{
	rl.prompt();
})
};

const validateId=id=>{
	return new Sequelize.Promise((resolve,reject)=>{
		if(typeof id==="undefined"){
			reject(new Error(`Falta el parametro <id>.`));

		}else{
			id=parseInt(id); //coger la parte entera y descartar lo demás
			if(Number.isNaN(id)){
				reject(new Error(`El valor del parametro <id> no es un número.`));
			}else{
				resolve(id);
			}
		}
	});
};

exports.showCmd = (rl,id)=>{
	
	validateId(id)
	.then(id=>models.quiz.findById(id))
	.then(quiz=>{
		if(!quiz){
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}
		log(`${colorize(quiz.id,'magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(error=>{
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();

	});
};

/**
* probamos el Quiz indicado
*/
exports.testCmd = (rl,id) =>{
validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz){
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
           return makeQuestion(rl,colorize(quiz.question +'? ','red'))
                .then (respuesta => {
                    if (respuesta.toLowerCase().trim() === quiz.answer.toLowerCase()) {
                        log(`Su respuesta es correcta.`);
                        biglog('Correcta', 'green');
                    } else {
                        log(`Su respuesta es incorrecta.`);
                        biglog('Incorrecta', 'red');
                    }
                    ;
                });
        })
               .catch(Sequelize.ValidationError, error =>{
                    errorlog('El quiz es erróneo:');
                    error.errors.forEach(({message}) => errorlog(message));
                })
                .catch(error =>{
                    errorlog(error.message);
                })
                .then(() => {
                    rl.prompt();
                });

        };

/**
* Jugamos al Quiz indicado
*/
exports.playCmd =rl=>{
	
		let score = 0;
	let toBeResolved = [];
    let i=0;
    return models.quiz.findAll()
	.then(quizzes => {
		quizzes.forEach((quiz) =>{
			toBeResolved[i]=quiz.id;
			i++;
		})
			return toBeResolved;
	})
	.then(toBeResolved => {
	const playOne= () =>{
			if(toBeResolved.length === 0){
				log(`No hay nada mas que preguntar`);
				log(` Fin:` + score);
				biglog(score, 'blue');
				
				rl.prompt();
			}else{
				let preguntas=Math.floor(Math.random()*(toBeResolved.length));
				let id= toBeResolved[preguntas];
				toBeResolved.splice(preguntas,1);
				validateId(id)
				.then(id => models.quiz.findById(id))
				
				.then(quiz => {
					if (!quiz){
						throw new Error(`No existe un quiz asociado al id=${id}.`);
					}
					
					return makeQuestion(rl, quiz.question+'? ')
					.then(a => {
						if(( a.toLowerCase()) === (quiz.answer.toLowerCase().trim())){
							score++;
							log(`Correcto - Lleva `+ score + `  aciertos`);
							playOne();
								
						}else{
							log(`Incorrecto. `);
							log(`Fin: `+ score);
							
							rl.prompt();
						}	
					});
				})
			}
    	}	
    playOne();
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.deleteCmd =(rl,id)=>{
	
	validateId(id)
	.then(id=>models.quiz.destroy({where:{id}}))
	.catch(error=>{
		errorlog(error.message);

	})
	.then(()=>{
		rl.prompt();
	});
};

exports.editCmd =(rl, id)=>{
	
	validateId(id)
	.then(id=>models.quiz.findById(id))
	.then(quiz=>{
		if(!quiz){
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}
		process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.question)},0);
		return makeQuestion(rl, 'Introduzca la pregunta:')
		.then(q=>{
			process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.answer)},0);
		return makeQuestion(rl, 'Introduzca la respuesta:')
		.then(a=>{
			quiz.question=q;
			quiz.answer=a;
			return quiz;
		});

		});
	})
	.then(quiz=>{
		return quiz.save();
	})
	.then(quiz=>{
		log(`${colorize(quiz.id,'magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	 .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
	
};

exports.creditsCmd =rl=>{
	log('Autores de la practica');
	log('Angela Zaragüeta Muñoz', 'green');
	
	rl.prompt();
};