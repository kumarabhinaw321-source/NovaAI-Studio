let currentMode="chat";

function scrollToTools(){
  document.getElementById("tools").scrollIntoView({behavior:"smooth"});
}

function openAI(mode){
  currentMode=mode;
  const names={writer:"AI Writer",script:"AI Script Writer",caption:"Caption Generator",chat:"AI Chat"};
  document.getElementById("toolTitle").textContent=names[mode]||"AI Tool";
  const ws=document.getElementById("workspace");
  ws.style.display="block";
  document.getElementById("prompt").focus();
  ws.scrollIntoView({behavior:"smooth",block:"center"});
}

function closeWorkspace(){document.getElementById("workspace").style.display="none"}

function clearAI(){
  document.getElementById("prompt").value="";
  document.getElementById("result").textContent="";
}

async function generateAI(){
  const prompt=document.getElementById("prompt").value.trim();
  if(!prompt){alert("Please enter an idea first.");return}
  const loading=document.getElementById("loading");
  const result=document.getElementById("result");
  loading.hidden=false; result.textContent="";
  try{
    const res=await fetch("/api/ai",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({prompt,mode:currentMode})
    });
    const data=await res.json();
    result.textContent=data.answer||("Error: "+(data.error||"Unknown error"));
  }catch(e){result.textContent="Connection error: "+e.message}
  finally{loading.hidden=true}
}


let selectedPhoto = null;
let compressedUrl = null;

function openCompressor(){
  const el=document.getElementById("compressor");
  el.style.display="block";
  el.scrollIntoView({behavior:"smooth",block:"center"});
}

function closeCompressor(){
  document.getElementById("compressor").style.display="none";
}

function updateQuality(){
  document.getElementById("qualityValue").textContent=document.getElementById("qualityRange").value+"%";
}

function formatBytes(bytes){
  if(bytes < 1024) return bytes+" B";
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1)+" KB";
  return (bytes/(1024*1024)).toFixed(2)+" MB";
}

function loadPhoto(event){
  const file=event.target.files && event.target.files[0];
  if(!file) return;
  if(!file.type.startsWith("image/")){alert("Please choose an image file.");return;}
  selectedPhoto=file;
  const originalUrl=URL.createObjectURL(file);
  const img=document.getElementById("originalPreview");
  img.onload=()=>URL.revokeObjectURL(originalUrl);
  img.src=originalUrl;
  document.getElementById("compressBtn").disabled=false;
  document.getElementById("photoPreview").hidden=false;
  document.getElementById("compressedPreview").removeAttribute("src");
  document.getElementById("downloadPhoto").hidden=true;
  document.getElementById("photoStatus").textContent=`Selected: ${file.name} • ${formatBytes(file.size)}`;
}

function compressPhoto(){
  if(!selectedPhoto) return;
  const btn=document.getElementById("compressBtn");
  const status=document.getElementById("photoStatus");
  btn.disabled=true;
  status.textContent="Compressing in your browser...";
  const img=new Image();
  const sourceUrl=URL.createObjectURL(selectedPhoto);
  img.onload=()=>{
    const maxWidth=Number(document.getElementById("maxWidth").value);
    const scale=maxWidth>0 ? Math.min(1,maxWidth/img.naturalWidth) : 1;
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const ctx=canvas.getContext("2d");
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality="high";
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    URL.revokeObjectURL(sourceUrl);
    const type=document.getElementById("photoFormat").value;
    const quality=Number(document.getElementById("qualityRange").value)/100;
    canvas.toBlob(blob=>{
      btn.disabled=false;
      if(!blob){status.textContent="Could not create the compressed image.";return;}
      if(compressedUrl) URL.revokeObjectURL(compressedUrl);
      compressedUrl=URL.createObjectURL(blob);
      document.getElementById("compressedPreview").src=compressedUrl;
      const download=document.getElementById("downloadPhoto");
      const ext=type==="image/png"?"png":type==="image/jpeg"?"jpg":"webp";
      download.href=compressedUrl;
      download.download="novaai-compressed-photo."+ext;
      download.hidden=false;
      const saved=Math.max(0,Math.round((1-blob.size/selectedPhoto.size)*100));
      status.textContent=`Original: ${formatBytes(selectedPhoto.size)} → Compressed: ${formatBytes(blob.size)} • ${saved}% smaller • ${canvas.width}×${canvas.height}`;
    },type,quality);
  };
  img.onerror=()=>{URL.revokeObjectURL(sourceUrl);btn.disabled=false;status.textContent="Could not read this image."};
  img.src=sourceUrl;
}
