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

    public function createNextVersion(Form $form, User $user, array $schema): FormVersion
    {
        return DB::transaction(function () use ($form, $user, $schema) {

            $currentVersion = $form->currentVersion;

            if (! $currentVersion) {
                return $this->createInitialVersion($form, $user, $schema);
            }

            $newHash = $this->hashService->schema($schema);

            if ($currentVersion->schema_hash === $newHash) {
                return $currentVersion;
            }

            $nextVersion = FormVersion::create([
                'form_id' => $form->id,
                'version_number' => $currentVersion->version_number + 1,
                'schema_json' => $schema,
                'schema_hash' => $newHash,
                'created_by' => $user->id,
            ]);

            $form->update(['current_version_id' => $nextVersion->id]);

            return $nextVersion;
        });
    }
}
