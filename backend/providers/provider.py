from abc import ABC, abstractmethod

class AnimeProvider(ABC):
    """
    Classe abstrata que define como um provedor de vídeo deve se comportar.
    """
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Nome do provedor (ex: 'AnimeX', 'GogoY')"""
        pass

    @property
    @abstractmethod
    def base_url(self) -> str:
        """URL base do site alvo"""
        pass

    @abstractmethod
    async def search_video(self, anime_title: str, episode: int):
        """
        Deve retornar o link do vídeo (mp4/m3u8) para o player.
        """
        pass