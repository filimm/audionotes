import * as Dialog from '@radix-ui/react-dialog' //radix é uma biblioteca de componentes que agilizam o desenvolvimento de elementos como modais por exemplo
import { X } from 'lucide-react' // lucide é uma biblioteca de ícones
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

//criação de propriedade no componente NewNoteCArd
//propriedade criada para poder receber a função onCreatedNote do componente app.tsx
interface NewNoteCardProps {
     onNoteCreated: (content: string) => void   
}

//variavel criada no escopo global para poder ser usada em vários componentes
let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({onNoteCreated}: NewNoteCardProps){

    // ao criar variavel booleana o nome deve ser uma pergunta
    const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState(true)
    const [isRecording, setIsRecording] = useState(false)
    const [content, setContent] = useState('') 

    function handleStartEditor(){
        setShouldShowOnBoarding(false)
    }

    // como se trata de função para um evento javascrip a função recebe um parametro de evento
    // é necessário tipar o evento dizendo qual evento que é "ChangeEvent"
    // como ChangeEvent se aplica a diversos elementos no HTML é necessário informar entre <> qual elemento html se aplica
    function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>){

        setContent(event.target.value)

        if (event.target.value === '') {
            setShouldShowOnBoarding(true)
        }
    }

    //formulario tem por padrão enviar o usuario para outra página ao clicar num botão com submit
    //utilizamos o metodo preventDefault() para proibir o elemento de agir no comportamento padrão dele
    function handleSaveNote(event: FormEvent) {
        event.preventDefault()

        if(content === '') {
            return
        }

        onNoteCreated(content)
        setContent('')
        setShouldShowOnBoarding(true)

        toast.success('Nota criada com sucesso!')
    }

    function handleStartRecording(){        
        const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

        if(!isSpeechRecognitionAPIAvailable) {
            alert('Seu navegador não suporta a API de gravação')
            return
        }

        setIsRecording(true)
        setShouldShowOnBoarding(false)

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
        speechRecognition = new SpeechRecognitionAPI()
        speechRecognition.lang = 'pt-BR'
        speechRecognition.continuous = true //permanece gravando até que seja pedido para parar pois por padrão a api para de gravar se ficar um tempo mudo
        speechRecognition.maxAlternatives = 1 //se a api não entender o que você disse aqui se define a quantidade de opções de palavras
        speechRecognition.interimResults = true // digita enquanto fala

        speechRecognition.onresult = (event) => {
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            }, '')

            setContent(transcription)
        }

        speechRecognition.onerror = (event) => {
            console.error(event)
        }

        speechRecognition.start()

    }

    function handleStopRecording() {
        setIsRecording(false)

        if (speechRecognition != null) {
            speechRecognition.stop()
        }
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 p-5 gap-3 overflow-hidden text-left outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
            <span className="text-sm font-medium text-slate-200">Adicionar nota</span>
            <p className="text-sm leading-6 text-slate-400">Grave uma nota em áudio que será convertida para texto automaticamente.</p>

          </Dialog.Trigger>
          <Dialog.Portal>
                <Dialog.Overlay className="inset-0 fixed bg-black/50" />
                <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex-col outline-none">
                    <Dialog.Close className="absolute top-0 right-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
                        < X className="size-5" />
                    </Dialog.Close>
                    <form className="flex-1 flex flex-col">
                    <div className="flex flex-1 flex-col gap-3 p-5">
                        <span className="text-sm font-medium text-slate-300">
                            Adicionar uma nota
                        </span>
                        
                        {
                        shouldShowOnBoarding ? (
                        <p className="text-sm leading-6 text-slate-400">
                           Comece <button type="button" onClick={handleStartRecording} className="font-medium text-lime-400 hover:underline">gravando uma nota</button> em áudio ou se preferir <button onClick={handleStartEditor} className="font-medium text-lime-400 hover:underline">utilize apenas texto</button>
                        </p>) : (
                            <textarea 
                                autoFocus 
                                className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                                onChange={handleContentChange}
                                value={content}
                            />
                        )
                        }
                    </div>

                    {isRecording ? (
                        <button 
                        type="button"
                        onClick={handleStopRecording}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none absolute bottom-0 font-medium hover:text-slate-100"
                    >
                        <div className="size-3 rounded-full bg-red-500 animate-pulse"></div>
                        Gravando! (clique para interromper)
                    </button>
                    ) :

                    <button 
                        type="button"
                        onClick={handleSaveNote}
                        className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none absolute bottom-0 font-medium hover:bg-lime-500"
                    >
                        Salvar nota
                    </button>
                
                    }

                    
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
        
    )
}