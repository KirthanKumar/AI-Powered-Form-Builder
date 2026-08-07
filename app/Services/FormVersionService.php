<?php

namespace App\Services;

use App\Models\Form;
use App\Models\FormVersion;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class FormVersionService
{
    public function __construct(protected HashService $hashService) {}

    public function createInitialVersion(Form $form, User $user, array $schema): FormVersion
    {
        return DB::transaction(function () use ($form, $user, $schema) {
            $version = FormVersion::create([
                'form_id' => $form->id,
                'version_number' => FormVersion::INITIAL_VERSION,
                'schema_json' => $schema,
                'schema_hash' => $this->hashService->schema($schema),
                'created_by' => $user->id,
            ]);

            $form->update(['current_version_id' => $version->id]);

            return $version;
        });
    }
}
