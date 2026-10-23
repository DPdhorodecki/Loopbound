# Loopbound

> *A sala se lembra de você. É o único jeito de sair.*

**Loopbound** é um jogo de puzzle em grade para navegador, em pixel art. Cada tentativa dura poucos passos. Quando o ciclo acaba, a sala se reorganiza — mas o seu trajeto fica para trás como um **eco**: um fantasma que repete exatamente o que você fez.

Ecos não empurram caixotes nem pegam gemas. Mas eles **têm peso**: seguram placas de pressão e mantêm portas abertas. Quase toda fase só é resolvida quando você deixa de tentar ser rápido e começa a montar uma equipe de você mesmo.

## Status

| Etapa | Estado |
|---|---|
| Design (GDD) | ✅ concluído |
| Protótipo jogável | ⏳ próximo |
| Conteúdo (10 fases) | ⏳ |
| Deploy no GitHub Pages | ⏳ |

📄 **Documento de design completo:** [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md)

## Como vai funcionar

- **Gênero:** puzzle em grade, visão top-down 3/4, câmera fixa.
- **Ciclo:** orçamento de 8–24 passos. Termina com `TAB`, morte ou esgotamento — e vira um eco.
- **Ecos:** até 3 por fase, reproduzindo a trilha gravada do ciclo anterior.
- **Elementos:** caixotes, blocos pesados, placas e portas coloridas, âncoras persistentes, chaves, gemas e vazio.
- **Plataforma:** navegador, teclado ou toque, 60 fps, sem downloads.

## Stack prevista

Vite + TypeScript + Canvas2D, sem engine e sem assets binários (sprites em mapas de caracteres e áudio sintetizado em WebAudio). Deploy automático no GitHub Pages.

## Estrutura do repositório

```
docs/GAME_DESIGN.md   plano completo: regras, arte, fases, arquitetura e roadmap
```

## Licença

A definir.
