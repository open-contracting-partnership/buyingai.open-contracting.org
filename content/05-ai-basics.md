# *AI basics*

```
Who: Procurement teams
What: Overview of GenAI and agentic AI technologies, common use cases, and limitations and risks 
```

## What is AI

Artificial intelligence, or AI, is a term that describes computer systems designed to perform complex human-like tasks, such as perception, communication, analysis, and content creation. 

An overview of different forms of AI include: 

* **Machine learning,** which maps input data (often structured or numeric) to outputs such as predictions or classifications.  
* **Deep learning**, a branch of machine learning, uses multilayer neural networks to learn from complex, unstructured inputs like images, text, or video, and can produce outputs ranging from simple labels to complex generated content.  
* **Generative AI** (GenAI) uses deep learning models to generate new content, such as text, images, audio, or code, by predicting what is most probable based on patterns learned from training data. Large language learning models (LLMs) are a form of GenAI.   
* **Agentic AI** builds on GenAI technology like LLMs, as well as connections with other databases and tools through forms of robotic process automation (RPA), to independently perform complex tasks based on new and evolving inputs. For example, summarizing email text and then proactively scheduling calls. 

This guidance is focused on the latest evolutions of AI: GenAI and Agentic.

![][image1]

```
Defining artificial intelligence

There is no one single standard way of defining artificial intelligence and its various forms. For further information on how entities define AI, check out: 
 - The definition provided in the John S. McCain National Defense Authorization Act for Fiscal Year 2019, a commonly referenced US federal definition 
 - The EU Artificial Intelligence Act: General Provisions: Definitions
 - The International Organization for Standardization’s What Is Artificial Intelligence (AI)? 
```

## What is GenAI 

Generative AI (GenAI) is a type of AI that can “generate” new content, and passively responds to queries based on recognizing and reproducing patterns from its training data. The technology has recently evolved from simple image and text generation to multi-modal models that can generate content which can be challenging to distinguish from content created by humans. GenAI use cases range from text summarization, to question answering, to digital art creation, to code generation and beyond.

## What is Agentic AI

Agentic AI is an emerging technology that builds on GenAI capabilities to execute multi-step workflows. An agentic AI system can act independently to achieve directives. "Agentic" indicates the ability to act independently. Unlike other forms of AI that require prompting and step-by-step guidance, agentic AI can proactively and autonomously perform complex tasks. 

AI agents can communicate with each other and other software systems to automate existing processes, as well as make independent decisions. They understand their environments and available tools, and can adapt to changing conditions, enabling them to perform a variety of sophisticated workflows. Agentic AI typically builds upon multiple hyper-specialized agents, with each focused on a narrow area of tasks. These AI-powered agents can coordinate with each other, sharing information and handing off tasks as needed. For example, agentic AI can help a developer not only write code, but automatically test and debug it, or send emails and then automatically schedule meetings based on the contents of the reply. 

## GenAI Stack 

GenAI technology encompasses a lot of different functions. The set of technologies that work together to perform these functionalities is known as the GenAI technology stack. This stack can be thought of as three layers that build on each other and work together: the foundation layer, middle layer, and application layer. 

**Foundation layer: the model infrastructure {collapsable}** 

At the bottom of the stack are the foundation models (like GPT-5, Claude Sonnet, or Gemini Pro) and the infrastructure needed to run them. GenAI is powered by foundation models. Foundation models are sets of trained neural networks. They are pre-trained on tremendously large sets of data. Often these models were created based on publicly available data, such as large portions of the internet, books, and other text sources. GenAI can be customized for specific needs through a process called fine-tuning, which retrains the model on more specific data. 

**Middle layer: integration services {collapsable}** 

The middle layer consists of solutions and services that make the foundation models usable for specific applications. This includes the application programming interface (API) services that provide access to foundation models, development tools for customizing AI capabilities, and security and governance frameworks, as well as integration services that connect AI with existing systems. 

**Application layer: solutions {collapsable}**

The top layer consists of the actual applications that people interact with. These might be AI-powered document processing systems, virtual assistants for citizen services, content generation solutions for organizational communications, or specialized analytical applications. 

![][image2]

```
icon: 
background:gray
---

To understand the GenAI stack, it can be helpful to think of it like an airplane. The foundation layer is like the engine. Just as an engine is needed to get the airplane off the ground, the foundation layer is essential for generative capacity. The middle layer is like the body of the aircraft. It is the recipient of the engine’s power, and is what makes the engine usable for flight. It’s also customizable to meet your purposes. For GenAI, this is the layer that takes the model's power, customizes it, and makes it usable. The application layer is like the cockpit. Just like a pilot uses instruments and controls to direct the airplane, a user interacts with applications to use the AI model. 

To take the airplane example further, agentic AI could be considered the autopilot: it’s technology that is intended to be fully capable of flying the airplane, but you’d still want human oversight to deal with emergencies and make sure all goes well. 
```

All the technologies in the GenAI tech stack are cloud-based. While not the focus here, this means that there are also additional hosting infrastructure considerations when buying AI. 

## When to consider GenAI and agentic agents 

Currently, GenAI technology is often compared to an intern at work. An intern can help you do your job well and make a task more efficient. However, you still wouldn’t want even the most brilliant intern making high-stakes decisions, or running crucial operations without oversight. You would also not ask an intern to carry out a task you are unable to perform yourself or, at least, you do not know what “good looks like” in relation to that task.

GenAI is great at producing results that are most *likely or plausible*. However, it does not know what is *true or correct* (it does not “know” anything). This is an important distinction. GenAI can also struggle with newer and more complex situations. Together, these factors mean that the outputs from GenAI should be checked by a human. 

If GenAI is like an intern, agentic AI is more like a junior colleague to whom you have made a directive. It works independently from start to finish: from receiving a request, to making decisions and implementing solutions based on its own interpretation and analysis of the context and initial input. Since agentic AI is able to leverage LLMs with other AI agents that specialize in tasks beyond text interpretation and generation, agentic AI is capable of dealing with more complex problems. However, agentic AI otherwise faces the same limitations as GenAI, and because it is more powerful, when things go wrong it can also be more risky. Multiple models are interconnected through agentic AI, so an inaccurate output from one of them could feed into another model that processes it inaccurately, and so on, leading to a final response that is impacted by multiple stages of errors.

**Consider using GenAI and agentic AI for:**

* Repetitive tasks, such as low-risk administrative activities  
* Creating an initial synthesis of a lot of different types of data   
* Generating first drafts or options for human review  
* IT modernization and development

**Avoid using GenAI and agentic AI for:**

* Higher-stakes decision-making  
* Decisions that require transparency and explainability  
* Low-quality data 

## GenAI and agentic agent use cases

GenAI and agentic AI are new technologies, and the public and private sectors are learning where this AI adds value for their organizations, and how to make the most of it. This is especially true for agentic AI. 

Five use cases for the public sector include: 

* **Document intelligence:** GenAI can be programmed to automatically read, summarize, and extract key information from thousands of pages in minutes – work that could take staff weeks to complete. This means that GenAI has the potential to transform how agencies handle documents, from complex regulations to registration forms. Ultimately, this may result in faster service delivery, better compliance, and significant operational savings. For example, document intelligence for the procurement function could look like having a “super-paralegal” who instantly flips through thousands of contracts, regulations, or vendor proposals and highlights the exact clauses you need.  
* **Supporting service delivery:** GenAI powers intelligent assistants, such as chatbots for internal or external use, which can handle thousands of inquiries simultaneously, providing information and processing routine requests automatically. These systems can integrate with existing service channels, while potentially reducing wait times and freeing up staff for complex cases. The technology can support consistent service levels in some domain areas while scaling automatically to meet demand peaks, with the potential for improving satisfaction while reducing operational costs. Imagine you’re running a call center during the scheduled enrollment period for a public health insurance program. Normally, you’d need to bring in dozens of temporary staff to handle the flood of calls. GenAI is like having an infinitely scalable team of front-desk clerks who answer routine questions and process simple requests automatically. Agentic AI has the potential to build on these capabilities by developing more effective strategies to assist customers. For example, an AI agent may, after several attempts to solve a resident’s issue, proceed to contact a human support agent and assign them to the case.   
* **Transcription and translation:** GenAI can create real-time text documentation of meetings or calls, as well as provide rapid translations. This functionality can help improve internal efficiency. For example, social workers can spend less time taking notes and more time on working directly with their clients, and public-facing documents can be quickly translated into different languages. Live simultaneous translation can also enable more community members to better participate in public meetings.      
* **IT modernization and development:** GenAI can assist developers by automating routine coding tasks, suggesting improvements, and helping modernize legacy systems. As part of this, GenAI can help technology ensure compliance with security requirements while accelerating digital transformation initiatives. Likewise, agentic AI can help with code modernization by leveraging machine learning, neural networks, LLMs, and automated reasoning, as well as potentially help with faster responses when technology breaks by expediting the incident response process. For example, agentic AI could automate the entire incident response pathway, rolling back issues, creating incident reports, and notifying any team members who need to stay informed.  
* **Data analysis and insights:** Multi-modal GenAI can process and analyze vast amounts of information from multiple sources – including reports, sensors, and operational data – to identify patterns and generate actionable insights that improve service delivery. These capabilities can help agencies make data-driven decisions, optimize resource allocation, and proactively address emerging challenges. This can reduce the manual effort required for complex analysis while enabling more responsive and effective public sector services. For example, [transportation agencies use multi-modal GenAI](https://tetcoalition.org/wp-content/uploads/2025/04/TETC_AI_SCOOP_Final.pdf) to analyze traffic data and optimize signal timing, [reducing commute times for schoolchildren](https://www.boston25news.com/news/local/boston-testing-ai-manage-traffic-lights-get-buses-school-time/WFJIUM6IZFENPHPXCSNTXHO62A/) and improving road safety for residents. Picture a highway patrol team trying to monitor every camera, road sensor, and traffic report manually – it would be impossible to catch everything. GenAI is like an always-on traffic controller that watches all feeds at once, spots patterns, and alerts you before a crash or bottleneck happens.

![][image3]

```
More on public sector GenAI use cases 
 - The State of California in the US offers a table with use cases
 - McKinsey offers a global overview of use cases organized by archetype 
- Danks Industri published a white paper on responsible use of AI assistants in the public and private sectors. 
- Stanford University Human-Centered Artificial Intelligence has issued a brief on validating claims about AI for policymakers.
```

## GenAI and agentic AI limitations and risks

GenAI and agentic AI holds strong potential to improve organizational efficiency and improve service delivery, but with these opportunities comes risk. It’s critical to understand the limitations of these systems so that your organization can use them strategically, responsibly, and safely. 

Common limitations include:

**GenAI and agentic AI lack a genuine understanding of the world,** **and hallucinate.** While AI models can generate sentences, these are simply outputs – the LLM doesn’t have a true human-like understanding of what the sentence means. Relatedly, GenAI and agentic AI hallucinate, in other words, give you inaccurate results or information that sounds authoritative but is false. Hallucination rates vary by model, [but no model is hallucination-free](https://www.nytimes.com/2025/05/05/technology/ai-hallucinations-chatgpt-google.html). Examples of hallucinations will be different depending on your use case, but could look like generating a realistic-sounding policy citation that doesn't actually exist, providing inaccurate or illegal advice to business owners through a chatbot, or wrongly denying access to benefits. AI’s tendency to hallucinate makes it essential to have a human-in-the-loop to review and think critically about the results, especially for decision-making that directly impacts service delivery. 

Agentic AI hallucinations can be particularly worrisome since they have the potential to impact workflows. For example, if the model generates false information and then relays it to the rest of the AI agents, incorrect data can rapidly spread, escalating errors in the final output. 

For the public sector, both GenAI and agentic AI hallucinations could have severe real-world implications. Organizations must be confident in their use case and solution before using it extensively.

**GenAI and agentic AI results depend on their training data.** GenAI models are only as good as the data they are trained on. For example, if your model is only trained on data up to October 2024, it would be unable to tell you current regulations. This is why understanding the training data sources matters a lot, as well as understanding your own data quality if you will be using it to further refine the model. 

Given their reliance on training data, GenAI and agentic AI may pose data security and privacy risks. When you input data into AI systems, that information may be stored, processed, or even used to train future models unless specific protections are in place. This is particularly important for government data that includes personally identifiable information or sensitive operational details. Organizations should ensure their AI solutions include appropriate data-handling safeguards and comply with relevant privacy regulations.

**GenAI and agentic AI have a limited ability to explain its results.** GenAI solutions cannot explain in perfect detail how they arrived at their conclusions. This lack of explainability can be fine in some situations, but not ok in others where explainability is critical and a matter of legal risk. For example, an AI chatbot that provides assistance with navigating an unemployment application can be ok, while using an AI system to make decisions around qualifying for public benefits could expose governments to legal concerns given an individual’s right to due process.

Likewise, agentic AI produces results that can be hard to trace or reproduce. Since agentic AI works independently and with minimal human intervention, this can make testing, debugging, and determining where an AI model has gone wrong a challenge. 

**Agentic AI requires very strong system design**. The process of building a multi-agent architecture that effectively coordinates with other models, has specific information of how to carry out certain tasks, and can achieve high-level complex directives is a challenge. Moreover, agentic AI is a new area of technology that relies on successful deployment of other AI strategies. Given this complexity, public sector organizations may struggle to use agentic AI effectively even in low-risk situations where agentic AI could be a strong fit.

For more information on limitations and how to mitigate GenAI and agentic risks during your procurement process, check out our sections on *Myth-busting* and *Key questions to ask.* 

**GenAI and agentic AI requires ongoing support, which has cost implications.** When implemented thoughtfully, investments in AI can deliver strong returns through improved efficiency and service quality. However, the limitations we explore here have real cost implications for implementation. The need for human oversight, data quality improvements, and ongoing monitoring means AI adoption involves more than just technology costs. Organizations should budget for additional staff time to review AI outputs, potential data preparation work, and ongoing performance monitoring. 

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>