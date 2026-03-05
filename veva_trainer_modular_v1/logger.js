/* --- Tabletop thumbnail + modal (person search) --- */
.psTableWrap{
  position: relative;
  width: 100%;
  height: min(220px, 26vh);
  border-radius: 14px;
  border: 1px solid var(--border);
  overflow: hidden;
  background: rgba(255,255,255,0.03);
  margin: 10px 0 12px;
  cursor: zoom-in;
}
.psTableCanvas{
  width: 100%;
  height: 100%;
  display: block;
}
.psTableHint{
  position:absolute;
  top:10px;
  right:10px;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(0,0,0,0.42);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.92);
  backdrop-filter: blur(6px);
  pointer-events:none;
  user-select:none;
}
.psTableHint::before{ content:"🔍＋ "; }

.psTableModal{ position: fixed; inset: 0; z-index: 9999; }
.psTableModalBackdrop{ position:absolute; inset:0; background: rgba(0,0,0,0.55); }
.psTableModalDialog{
  position:absolute;
  left:50%; top:50%;
  transform: translate(-50%,-50%);
  width: min(980px, 92vw);
  height: min(680px, 82vh);
  border-radius: 16px;
  background: rgba(10,14,22,0.96);
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 18px 60px rgba(0,0,0,0.55);
  overflow:hidden;
}
.psTableModalHeader{
  height: 44px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 0 12px 0 14px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.psTableModalTitle{ font-weight: 650; opacity: 0.92; }
.psTableModalClose{
  width: 30px; height: 30px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.9);
  cursor:pointer;
}
.psTableModalBody{ height: calc(100% - 44px); padding: 12px; }
.psTableCanvasModal{
  width:100%; height:100%; display:block;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.03);
}
