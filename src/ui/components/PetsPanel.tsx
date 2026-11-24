import type { Action } from '../../game/reducer';
import type { GameState, Pet } from '../../game/types';
import { feedCost } from '../../game/pets';
import { formatTL } from '../../game/format';
import { Button } from './Button';
import { itemImageUrl } from './ItemCard';
import { extraImage } from '../images';

function PetCard({ pet, img, role }: { pet: Pet; img: string | undefined; role: string }) {
  return (
    <div className="pet" role="group" aria-label={pet.name}>
      {img ? <img className="pet__img" src={img} alt="" /> : <span className="pet__img pet__img--emoji" aria-hidden="true">{role === 'Bekçi' ? '🐕' : '🐈'}</span>}
      <div className="pet__body">
        <div className="row__title">{pet.name} <span className="muted">· {role}</span></div>
        <div className="meter__track"><div className="meter__fill" style={{ width: `${pet.happiness}%` }} /></div>
        <div className="row__sub">{pet.fed ? 'Bu ay karnı tok' : 'Bu ay mama bekliyor'}</div>
      </div>
    </div>
  );
}

/** Garajdaki evcil hayvanlar: köpek (bekçi), kedi (farelere karşı), haftalık mama. */
export function PetsPanel({ state, dispatch }: { state: GameState; dispatch(a: Action): void }) {
  const { dog, cat } = state.pets;
  const cost = feedCost(state);
  return (
    <section className="pets" aria-label="Hayvanların">
      {dog ? <PetCard pet={dog} role="Bekçi" img={dog.brand ? itemImageUrl({ id: 'pet', category: 'kopek', brand: dog.brand, model: dog.model ?? '', baseValue: 0, condition: 100, defects: [], tags: [], cleaned: false, painted: false, careCount: 0, caredToday: false, boughtFor: 0 }) : undefined} /> : null}
      {cat ? <PetCard pet={cat} role="Garaj kedisi" img={extraImage('ui/kedi')} /> : null}
      <div className="chips">
        {cost > 0 ? <Button small variant="primary" disabled={state.money < cost} onClick={() => dispatch({ type: 'feedPets' })}>{`Mama ver · ${formatTL(cost)}`}</Button> : null}
        {!cat ? <Button small onClick={() => dispatch({ type: 'adoptCat' })}>Sokak kedisini sahiplen</Button> : null}
      </div>
      {!dog ? <p className="hint">Bir köpek alıp satmak yerine yanında tutarsan garajı hırsızlara karşı korur. Kedi farelerin kabloları kemirmesini önler.</p> : null}
    </section>
  );
}
