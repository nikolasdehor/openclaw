def get_client_ip() -> str:
    """
    Retorna o IP real do cliente em um ambiente Streamlit.

    Tenta obter o IP através dos headers X-Forwarded-For ou X-Real-IP
    (comuns em proxies/load balancers). Se não disponível, retorna
    o Remote-Addr ou fallback para localhost.
    """
    try:
        import streamlit as st
        if hasattr(st, "request") and hasattr(st.request, "headers"):
            # Tenta X-Forwarded-For primeiro (pode conter múltiplos IPs)
            for header in ["X-Forwarded-For", "X-Real-IP"]:
                ip = st.request.headers.get(header)
                if ip:
                    # Pega apenas o primeiro IP da lista
                    return ip.split(",")[0].strip()
            # Fallback para Remote-Addr
            return st.request.headers.get("Remote-Addr", "127.0.0.1")
    except Exception:
        pass
    return "127.0.0.1"
